'use strict';

var _ = require('underscore'),
    assert = require('assert'),
    PlayerStats = require('./player_stats'),
    PlayerGame = require('./player_game'),
    PlayerPosition = require('./player_position'),
    Joi = require('joi');

function Player(attributes) {
    var validatedAttributes = Joi.validate(attributes, Player.schema, { stripUnknown: true });
    if(validatedAttributes.error) {
        throw validatedAttributes.error;
    }

    _.extendOwn(this, validatedAttributes.value);
    Object.freeze(this);
}

Player.schema = {
    _id: [Joi.object(), Joi.string().length(24)],
    name: Joi.string().min(1).required(),
    team: Joi.string().min(1).required(),
    position: Joi.string().valid(_.values(PlayerPosition)).optional(),
    games: Joi.array().items(PlayerGame.schema).required()
};

Player.create = function create(attributes) {
    if(attributes.games && attributes.games.length > 0) {
        attributes.games = attributes.games.map(function createPlayerGame(game) {
            return PlayerGame.create(game);
        });
    }

    return new Player(attributes);
};

Player.prototype.addGame = function addGame(playerGame) {
    var games = _.clone(this.games),
        existingGameIndex = _.findIndex(games, function(game) { return game.eid == playerGame.eid });

    if(existingGameIndex != -1) {
        games[existingGameIndex] = playerGame;
    } else {
        games.push(playerGame);
    }

    return Player.create(_.extend(_.clone(this), { games: games }));
};

Player.prototype.setPosition = function setPosition(position) {
    return Player.create(_.extend(_.clone(this), { position: position }));
};

Player.prototype.getStatsTotal = function getStatsTotal(statName) {
    return this.games.reduce(function addStatsFromGameToTotal(total, game) {
        return total + game.getStat(statName);
    }, 0);
};

Player.prototype.findAllPrecedingGames = function findAllPrecedingGames(game) {
    var orderedGames = this.getOrderedGames(),
        gameIndex = _.findIndex(orderedGames, function gameMatches(otherGame) {
            return game.eid == otherGame.eid;
        });

    return orderedGames.slice(0, gameIndex);
};

Player.prototype.findPrecedingGames = function findPrecedingGames(game, count) {
    var precedingGames = this.findAllPrecedingGames(game);
    return precedingGames.slice(Math.max(0, precedingGames.length - count), precedingGames.length);
};

Player.prototype.findPrecedingGamesAgainstOpponent = function findPrecedingGamesAgainstOpponent(game, count) {
    var opponent = game.opponent,
        precedingGames = this.findAllPrecedingGames(game),
        precedingGamesAgainstOpponent = _.filter(precedingGames, function gameMatchesOpponent(game) {
            return game.opponent == opponent;
        });

    return precedingGamesAgainstOpponent.slice(Math.max(0, precedingGamesAgainstOpponent.length - count), precedingGamesAgainstOpponent.length);
};

Player.prototype.findGamesAgainst = function findGamesAgainst(team) {
    return _.filter(this.games, function containsOpponent(game) { return team == game.opponent; });
};

Player.prototype.getOrderedGames = function getOrderedGames() {
    var gamesCopy = _.clone(this.games);

    gamesCopy.sort(function compareGames(a, b) {
        if(a.year < b.year || (a.year == b.year && a.week < b.week)) {
            return -1;
        } else if(a.year == b.year && a.week == b.week) {
            return 0;
        } else {
            return 1;
        }
    });

    return gamesCopy;
};

module.exports = Player;