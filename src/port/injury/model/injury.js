'use strict';

var _ = require('underscore'),
    assert = require('assert'),
    Joi = require('joi'),
    PlayerInjury = require('../../../application/domain/player_injury');

var MIN_YEAR = 2009;

var schema = {
    name: Joi.string().min(1).required(),
    team: Joi.string().min(1).required(),
    week: Joi.number().min(1).max(17).required(),
    year: Joi.number().min(MIN_YEAR).max((new Date).getFullYear()).required(),
    status: Joi.string().allow([PlayerInjury.STATUSES]).required(),
    reason: Joi.string().min(1).required(),
    played: Joi.boolean().required()
};

function Injury(attributes) {
    var validatedAttributes = Joi.validate(attributes, schema, { stripUnknown: true });
    if(validatedAttributes.error) {
        throw validatedAttributes.error;
    }

    _.extendOwn(this, validatedAttributes.value);
    Object.freeze(this);
}

Injury.create = function create(attributes) {
    return new Injury(attributes);
};

module.exports = Injury;