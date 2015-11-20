'use strict';

var Team = require('./application/domain/team'),
    InjuryRepository = require('./port/injury/injury_repository');

InjuryRepository.findByTeamAndYear(Team.BENGALS, 2009)
    .then(function displayInjuryPage(body) {
        console.log(body);
    })
    .done();