'use strict';

var _ = require('underscore'),
    Joi = require('joi');

var MIN_YEAR = 2009,
    MAX_YEAR = (new Date()).getFullYear();

function GameDate(attributes) {
    var validatedAttributes = Joi.validate(attributes, GameDate.schema, { stripUnknown: true });
    if(validatedAttributes.error) {
        throw validatedAttributes.error;
    }

    _.extendOwn(this, validatedAttributes.value);
    Object.freeze(this);
}

GameDate.schema = {
    week: Joi.number().min(1).max(19).required(),
    year: Joi.number().min(MIN_YEAR).max(MAX_YEAR).required()
};

GameDate.create = function create(attributes) {
    return new GameDate(attributes);
};

GameDate.getMinYear = function getMinYear() {
    return MIN_YEAR;
};

GameDate.getMaxYear = function getMaxYear() {
    return MAX_YEAR;
};

module.exports = GameDate;