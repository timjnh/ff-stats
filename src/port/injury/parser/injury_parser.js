'use strict';

module.exports = (function() {

    var _ = require('underscore'),
        cheerio = require('cheerio'),
        Injury = require('../model/injury'),
        PlayerInjury = require('../../../application/domain/player/player_injury');

    function InjuryParser(team, year) {
        this.team = team;
        this.year = year;
    }

    InjuryParser.create = function create(team, year) {
        return new InjuryParser(team, year);
    };

    InjuryParser.prototype.parseInjuries = function parseInjuries(injuryPageBody) {
        var _this = this,
            injuries = {},
            page = cheerio.load(injuryPageBody),
            injuryTable = page('table.injury_table'),
            rows = injuryTable.find('tr').slice(1); // first row is the header

        page(rows).each(function extractInjuriesFromRow(index, row) {
            var playerInjuries = [],
                injuryColumns = page(row).find('td'),
                playerName = normalizePlayerName(injuryColumns.first().attr('csk'));

            // first column is the player name
            injuryColumns = injuryColumns.slice(1);

            for(var i = 0; i < injuryColumns.length; i++) {
                playerInjuries.push(extractInjuryFromColumn.call(_this, playerName, i + 1, cheerio(injuryColumns.get(i))));
            }

            playerInjuries = _.compact(playerInjuries);

            if(playerInjuries.length) {
                injuries[playerName] = playerInjuries;
            }
        });

        return injuries;
    };

    function normalizePlayerName(playerName) {
        var firstName = playerName.split(',')[1],
            lastName = playerName.split(',')[0];

        return firstName.substr(0, 1) + ' ' + lastName;
    }

    function extractInjuryFromColumn(playerName, week, column) {
        var status,
            reason,
            played = !column.hasClass('played'); // for whatever reason, this is backwards

        if(cheerio(column).find('span').length) {
            reason = cheerio(column).find('span').attr('tip').split(':')[1].trim();
        }

        PlayerInjury.STATUSES.forEach(function checkElementForStatus(_status) {
            if(column.hasClass(_status)) {
                status = _status;
            }
        });

        if(status) {
            return Injury.create({
                name: playerName,
                team: this.team,
                week: week,
                year: this.year,
                status: status,
                reason: reason,
                played: played
            });
        }
    }

    return InjuryParser;
})();