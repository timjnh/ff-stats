'use strict';

module.exports = (function() {

    var _ = require('underscore'),
        cheerio = require('cheerio'),
        Injury = require('../model/injury'),
        PlayerInjury = require('../../../application/domain/player/player_injury'),
        logger = require('../../../lib/logger');

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
            injuryTable = page('table#team_injuries'),
            tbody = injuryTable.find('tbody'),
            rows = tbody.find('tr');

        page(rows).each(function extractInjuriesFromRow(index, row) {
            var playerInjuries = [],
                injuryColumns = page(row).find('th,td'),
                playerName = normalizePlayerName(injuryColumns.first().attr('csk'));

            // first column is the player name
            injuryColumns = injuryColumns.slice(1);

            for(var i = 0; i < injuryColumns.length; i++) {

                // don't go into the post season yet
                if(i + 1 > 19) {
                    break;
                }

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

    var INJURY_CLASS_TO_INJURY_MAPPING = {
        'probable': PlayerInjury.PROBABLE,
        'questionable': PlayerInjury.QUESTIONABLE,
        'out': PlayerInjury.OUT,
        'doubtful': PlayerInjury.DOUBTFUL,
        'I-R': PlayerInjury.INJURED_RESERVE,
        'injured-reserve': PlayerInjury.INJURED_RESERVE,
        'physically-unable': PlayerInjury.PHYSICALLY_UNABLE
    };

    function extractInjuryFromColumn(playerName, week, column) {
        var status,
            reason,
            played = !column.hasClass('dnp'); // dnp = did not play

        if(cheerio(column).attr('data-tip') && cheerio(column).attr('data-tip').length) {
            reason = cheerio(column).attr('data-tip').split(':')[1].trim();
        }

        Object.keys(INJURY_CLASS_TO_INJURY_MAPPING).forEach(function checkElementForStatus(_status) {
            if(column.hasClass(_status)) {
                status = INJURY_CLASS_TO_INJURY_MAPPING[_status];
            }
        });

        if(!played && !status) {
            logger.warn('Possible error case in the InjuryParser.  Player ' + playerName + ' did not play but has no injury status');
        }

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