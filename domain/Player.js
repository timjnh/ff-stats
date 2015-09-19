'use strict';

var _ = require('underscore'),
    assert = require('assert'),
    PlayerStats = require('./PlayerStats'),
    PlayerGame = require('./PlayerGame'),
    Joi = require('joi');

function Player(attributes) {
    var validatedAttributes = Joi.validate(attributes, Player.schema, { stripUnknown: true });
    if(validatedAttributes.error) {
        throw validatedAttributes.error;
    }

    _.extendOwn(this, validatedAttributes.value);
    Object.freeze(this);
    Object.freeze(this.games);
}

Player.schema = {
    _id: Joi.object(),
    name: Joi.string().min(1).required(),
    team: Joi.string().min(1).required(),
    games: Joi.array().items(PlayerGame.schema).required(),
    network: Joi.object()
};

Player.create = function create(attributes) {
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

Player.prototype.setNetwork = function setNetwork(network) {
    return Player.create(_.extend(_.clone(this), { network: network }));
};

Player.prototype.findPrecedingGames = function findPrecedingGames(game, count) {
    var orderedGames = this.getOrderedGames(),
        gameIndex = _.findIndex(orderedGames, function gameMatches(otherGame) {
            return game.eid == otherGame.eid;
        });

    return orderedGames.slice(Math.max(0, gameIndex - count), gameIndex);
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