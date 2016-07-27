'use strict';

var _ = require('underscore'),
    assert = require('assert'),
    Joi = require('joi'),
    TeamGame = require('./team_game');

function Team(attributes) {
    var validatedAttributes = Joi.validate(attributes, Team.schema, { stripUnknown: true });
    if(validatedAttributes.error) {
        throw validatedAttributes.error;
    }

    _.extendOwn(this, validatedAttributes.value);
    Object.freeze(this);
}

Team.schema = {
    _id: [Joi.object(), Joi.string().length(24)],
    name: Joi.string().min(1).required(),
    games: Joi.array().items(TeamGame.schema).required()
};

Team.create = function create(attributes) {
    if(attributes.games && attributes.games.length > 0) {
        attributes.games = attributes.games.map(function createTeamGame(game) {
            if(game instanceof TeamGame) {
                return game;
            } else {
                return TeamGame.create(game);
            }
        });
    }

    return new Team(attributes);
};

Team.prototype.addOrUpdateGames = function addOrUpdateGames(teamGames) {
    var games = _.clone(this.games);

    teamGames.forEach(function addTeamGame(teamGame) {
        var existingGameIndex = _.findIndex(games, function gameMatches(otherGame) {
            return teamGame.week == otherGame.week && teamGame.year == otherGame.year;
        });

        if(existingGameIndex == -1) {
            games.push(teamGame);
        } else {
            games[existingGameIndex] = games[existingGameIndex].merge(teamGame);
        }
    });

    return Team.create(_.extend(_.clone(this), { games: games }));
};

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
Team.BUCCANEERS = 'buccaneers';
Team.RAVENS = 'ravens';
Team.CARDINALS = 'cardinals';
Team.COWBOYS = 'cowboys';
Team.REDSKINS = 'redskins';
Team.FORTY_NINERS = '49ers';
Team.TEXANS = 'texans';

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
    Team.FALCONS,
    Team.BUCCANEERS,
    Team.RAVENS,
    Team.CARDINALS,
    Team.COWBOYS,
    Team.REDSKINS,
    Team.FORTY_NINERS,
    Team.TEXANS
];

Team.codes = {};
Team.codes[Team.PATRIOTS] = {
    threeLetterCityCode: 'nwe'
};
Team.codes[Team.PACKERS] = {
    threeLetterCityCode: 'gnb'
};
Team.codes[Team.VIKINGS] = {
    threeLetterCityCode: 'min'
};
Team.codes[Team.BEARS] = {
    threeLetterCityCode: 'chi'
};
Team.codes[Team.BILLS] = {
    threeLetterCityCode: 'buf'
};
Team.codes[Team.GIANTS] = {
    threeLetterCityCode: 'nyg'
};
Team.codes[Team.SEAHAWKS] = {
    threeLetterCityCode: 'sea'
};
Team.codes[Team.TITANS] = {
    threeLetterCityCode: 'oti'
};
Team.codes[Team.DOLPHINS] = {
    threeLetterCityCode: 'mia'
};
Team.codes[Team.CHARGERS] = {
    threeLetterCityCode: 'sdg'
};
Team.codes[Team.BENGALS] = {
    threeLetterCityCode: 'cin'
};
Team.codes[Team.COLTS] = {
    threeLetterCityCode: 'clt'
};
Team.codes[Team.BRONCOS] = {
    threeLetterCityCode: 'den'
};
Team.codes[Team.JETS] = {
    threeLetterCityCode: 'nyj'
};
Team.codes[Team.BROWNS] = {
    threeLetterCityCode: 'cle'
};
Team.codes[Team.RAMS] = {
    threeLetterCityCode: 'ram'
};
Team.codes[Team.JAGUARS] = {
    threeLetterCityCode: 'jax'
};
Team.codes[Team.SAINTS] = {
    threeLetterCityCode: 'nor'
};
Team.codes[Team.LIONS] = {
    threeLetterCityCode: 'det'
};
Team.codes[Team.EAGLES] = {
    threeLetterCityCode: 'phi'
};
Team.codes[Team.RAIDERS] = {
    threeLetterCityCode: 'rai'
};
Team.codes[Team.STEELERS] = {
    threeLetterCityCode: 'pit'
};
Team.codes[Team.CHIEFS] = {
    threeLetterCityCode: 'kan'
};
Team.codes[Team.PANTHERS] = {
    threeLetterCityCode: 'car'
};
Team.codes[Team.FALCONS] = {
    threeLetterCityCode: 'atl'
};
Team.codes[Team.BUCCANEERS] = {
    threeLetterCityCode: 'tam'
};
Team.codes[Team.RAVENS] = {
    threeLetterCityCode: 'rav'
};
Team.codes[Team.CARDINALS] = {
    threeLetterCityCode: 'crd'
};
Team.codes[Team.COWBOYS] = {
    threeLetterCityCode: 'dal'
};
Team.codes[Team.REDSKINS] = {
    threeLetterCityCode: 'was'
};
Team.codes[Team.FORTY_NINERS] = {
    threeLetterCityCode: 'sfo'
};
Team.codes[Team.TEXANS] = {
    threeLetterCityCode: 'htx'
};

Team.getId = function getId(teamName) {
    var teamIndex = Team.TEAMS.indexOf(teamName);
    assert(teamIndex != -1, 'Could not find id for team "' + teamName + '"');
    return teamIndex;
};

Team.getThreeLetterCityCode = function getThreeLetterCityCode(teamName) {
    return Team.codes[teamName].threeLetterCityCode;
};

module.exports = Team;