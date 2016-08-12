'use strict';

var _ = require('underscore'),
    Joi = require('joi');

var MIN_YEAR = 2009,
    MAX_YEAR = (new Date()).getFullYear(),
    MIN_WEEK = 1,
    MAX_WEEK = 19;

function GameDate(attributes) {
    var validatedAttributes = Joi.validate(attributes, GameDate.schema, { stripUnknown: true });
    if(validatedAttributes.error) {
        throw validatedAttributes.error;
    }

    _.extendOwn(this, validatedAttributes.value);
    Object.freeze(this);
}

GameDate.schema = {
    week: Joi.number().min(MIN_WEEK).max(MAX_WEEK).required(),
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

GameDate.getMinWeek = function getMinWeek() {
    return MIN_WEEK;
};

GameDate.getMaxWeek = function getMaxWeek() {
    return MAX_WEEK;
};

module.exports = GameDate;