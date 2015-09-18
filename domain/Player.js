'use strict';

var _ = require('underscore'),
    assert = require('assert'),
    PlayerStats = require('./PlayerStats'),
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
    name: Joi.string().min(1).required(),
    points: Joi.number().required(),
    stats: Joi.object(PlayerStats.schema).required()
};

Player.create = function create(attributes) {
    return new Player(attributes);
};

module.exports = Player;