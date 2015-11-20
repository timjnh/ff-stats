'use strict';

var _ = require('underscore'),
    assert = require('assert'),
    Joi = require('joi');

var MIN_YEAR = 2009;

function PlayerInjury(attributes) {
    var validatedAttributes = Joi.validate(attributes, PlayerInjury.schema, { stripUnknown: true });
    if(validatedAttributes.error) {
        throw validatedAttributes.error;
    }

    _.extendOwn(this, validatedAttributes.value);
    Object.freeze(this);
}

PlayerInjury.schema = {
    week: Joi.number().min(1).max(17).required(),
    year: Joi.number().min(MIN_YEAR).max((new Date).getFullYear()).required(),
    status: Joi.string().allow([PlayerInjury.STATUSES]).required(),
    reason: Joi.string().min(1).required(),
    played: Joi.boolean().required()
};

PlayerInjury.create = function create(attributes) {
    return new PlayerInjury(attributes);
};

PlayerInjury.PROBABLE = 'probable';
PlayerInjury.QUESTIONABLE = 'questionable';
PlayerInjury.OUT = 'out';
PlayerInjury.DOUBTFUL = 'doubtful';
PlayerInjury.INJURED_RESERVE = 'injured-reserve';

PlayerInjury.STATUSES = [
    PlayerInjury.PROBABLE,
    PlayerInjury.QUESTIONABLE,
    PlayerInjury.OUT,
    PlayerInjury.DOUBTFUL,
    PlayerInjury.INJURED_RESERVE
];

module.exports = PlayerInjury;