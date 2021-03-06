'use strict';

var _ = require('underscore'),
    Joi = require('joi'),
    PlayerStats = require('./player_stats'),
    InputSet = require('../inputs/input_set'),
    GameDate = require('../season/game_date');

function PlayerGame(attributes) {
    var validatedAttributes = Joi.validate(attributes, PlayerGame.schema, { stripUnknown: true });
    if(validatedAttributes.error) {
        throw validatedAttributes.error;
    }

    _.extendOwn(this, validatedAttributes.value);
    Object.freeze(this);
}

PlayerGame.schema = {
    eid: Joi.string().min(1).required(),
    week: Joi.number().min(1).max(17).required(),
    year: Joi.number().required(),
    date: Joi.date().min(new Date(GameDate.getMinYear())).required(),
    opponent: Joi.string().min(1).required(),
    points: Joi.number().required(),
    stats: Joi.object(PlayerStats.schema).required(),
    inputs: Joi.object().required()
};

PlayerGame.create = function create(attributes) {
    var attributesCopy = _.clone(attributes);

    if(attributesCopy.stats) {
        attributesCopy.stats = PlayerStats.create(attributesCopy.stats);
    }
    if(attributesCopy.inputs) {
        attributesCopy.inputs = InputSet.create(attributesCopy.inputs);
    }

    return new PlayerGame(attributesCopy);
};

PlayerGame.prototype.update = function update(attributes) {
    return PlayerGame.create(_.extend(_.clone(this), attributes));
};

PlayerGame.prototype.getStat = function getStat(statName) {
    return this.stats.getValue(statName);
};

PlayerGame.prototype.hasStats = function hasStats() {
    return !this.stats.isEmpty();
};

PlayerGame.prototype.hasBeenPlayed = function hasBeenPlayed() {
    return this.date <= new Date();
};

PlayerGame.prototype.hasAllInputs = function hasAllInputs(inputs) {
    for(var k in inputs) {
        if(!this.inputs.hasValueForInput(inputs[k])) {
            return false;
        }
    }
    return true;
};

PlayerGame.prototype.getGameDate = function getGameDate() {
    return GameDate.create({ week: this.week, year: this.year });
};

module.exports = PlayerGame;