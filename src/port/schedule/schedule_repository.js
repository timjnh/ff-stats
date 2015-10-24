'use strict';

var q = require('q'),
    _ = require('underscore'),
    assert = require('assert'),
    sprintf = require('sprintf-js').sprintf,
    superagent = require('superagent'),
    xml2js = require('xml2js');

function ScheduleRepository() {
    this.baseUrl = 'http://www.nfl.com/ajax/scorestrip?season=%(year)s&week=%(week)s&seasonType=REG';
}

ScheduleRepository.prototype.findGamesByYearAndWeekNumber = function findGamesByYearAndWeekNumber(year, weekNumber) {
    var _this = this,
        url = sprintf(this.baseUrl, { year: year, week: weekNumber });

    console.log(url);
    return new q.Promise(function scheduleLookup(resolve, reject) {
        superagent
            .get(url)
            .end(function(err, result) {
                if(err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })
        .then(
            function parseScheduleIntoGames(response) {
                return _this._parseScheduleIntoGames(response.text);
            },
            function handleScheduleLookupError(error) {
                console.log(error);
                throw error;
            }
        )
        .then(function formatGames(games) {
            return _this._formatGames(games, year, weekNumber);
        });
};

ScheduleRepository.prototype._parseScheduleIntoGames = function _parseScheduleIntoGames(xmlSchedule) {
    return q.Promise(function parseXml(resolve, reject) {
        xml2js.parseString(xmlSchedule, function(err, games) {
            if(err) {
                reject(err);
            } else {
                if(!games || !games.ss || !games.ss.gms || !games.ss.gms[0] || !games.ss.gms[0].g) {
                    console.error('Game structure invalid!');
                    console.error(JSON.stringify(games));
                    assert(false);
                }

                games = games.ss.gms[0].g;
                resolve(_.pluck(games, '$'));
            }
        });
    });
};

ScheduleRepository.prototype._formatGames = function _formatGames(games, year, week) {
    return games.map(function formatGame(game) {
        var date = new Date(
            year,
            parseInt(game.eid.substring(4, 6)) - 1,
            parseInt(game.eid.substring(6, 8)),
            parseInt(game.t.substring(0, 2)) + 12,
            parseInt(game.t.substring(3, 5))
        );

        return {
            eid: game.eid,
            week: week,
            year: year,
            date: date,
            home: game.hnn,
            away: game.vnn,
            homeScore: game.hs,
            awayScore: game.vs
        };
    });
};

module.exports = new ScheduleRepository();