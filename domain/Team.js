'use strict';

var assert = require('assert');

function Team() {}

Team.PATRIOTS = 'patriots';
Team.PACKERS = 'packers';
Team.VIKINGS = 'vikings';
Team.BEARS = 'bears';
Team.BILLS = 'bills';
Team.GIANTS = 'giants';
Team.SEAHAWKS = 'seahawks';
Team.TITANS = 'titans';
Team.DOLPHINS = 'dolphins';
Team.CHARGERS = 'chargers';
Team.BENGALS = 'bengals';
Team.COLTS = 'colts';
Team.BRONCOS = 'broncos';
Team.JETS = 'jets';
Team.BROWNS = 'browns';
Team.RAMS = 'rams';
Team.JAGUARS = 'jaguars';
Team.SAINTS = 'saints';
Team.LIONS = 'lions';
Team.EAGLES = 'eagles';
Team.RAIDERS = 'raiders';
Team.STEELERS = 'steelers';
Team.CHIEFS = 'chiefs';
Team.PANTHERS = 'panthers';
Team.FALCONS = 'falcons';

Team.TEAMS = [
    Team.PATRIOTS,
    Team.PACKERS,
    Team.VIKINGS,
    Team.BEARS,
    Team.BILLS,
    Team.GIANTS,
    Team.SEAHAWKS,
    Team.TITANS,
    Team.DOLPHINS,
    Team.CHARGERS,
    Team.BENGALS,
    Team.COLTS,
    Team.BRONCOS,
    Team.JETS,
    Team.BROWNS,
    Team.RAMS,
    Team.JAGUARS,
    Team.SAINTS,
    Team.LIONS,
    Team.EAGLES,
    Team.RAIDERS,
    Team.STEELERS,
    Team.CHIEFS,
    Team.PANTHERS,
    Team.FALCONS
];

Team.getId = function getId(teamName) {
    var teamIndex = Team.TEAMS.indexOf(teamName);
    assert(teamIndex != -1, 'Could not find id for team "' + teamName + '"');
    return teamIndex;
};

module.exports = Team;