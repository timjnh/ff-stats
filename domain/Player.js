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
    games: Joi.array().items(PlayerGame.schema).required()
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

module.exports = Player;