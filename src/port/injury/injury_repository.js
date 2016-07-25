'use strict';

module.exports = (function() {

    var q = require('q'),
        superagent = require('superagent'),
        sprintf = require('sprintf-js').sprintf,
        InjuryParser = require('./parser/injury_parser'),
        Team = require('../../application/domain/team/team');

    function InjuryRepository() {
        this.baseUrl = 'http://www.pro-football-reference.com/teams/%(team)s/%(year)s_injuries.htm';
    }

    InjuryRepository.prototype.findByTeamAndYear = function findByTeamAndYear(team, year) {
        var injuryParser = InjuryParser.create(team, year),
            url = sprintf(this.baseUrl, { team: Team.getThreeLetterCityCode(team), year: year } );

        return new q.Promise(function retrieveStats(resolve, reject) {
            superagent
                .get(url)
                .end(function(err, response) {
                    if(err) {
                        reject(err);
                    } else {
                        resolve(injuryParser.parseInjuries(response.text));
                    }
                });
        });
    };

    return new InjuryRepository();
})();