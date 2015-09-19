'use strict';

var _ = require('underscore'),
    Joi = require('joi'),
    PlayerStats = require('./PlayerStats');

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
    week: Joi.number().min(1).max(16).required(),
    year: Joi.number().required(),
    opponent: Joi.string().min(1).required(),
    points: Joi.number().required(),
    stats: Joi.object(PlayerStats.schema).required()
};

PlayerGame.create = function create(attributes) {
    return new PlayerGame(attributes);
};

module.exports = PlayerGame;