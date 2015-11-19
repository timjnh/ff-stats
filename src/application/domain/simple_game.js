'use strict';

var _ = require('underscore'),
    assert = require('assert'),
    Joi = require('joi');

var MIN_YEAR = 1900;

var schema = {
    eid: Joi.string().min(1).required(),
    week: Joi.number().min(1).max(17).required(),
    year: Joi.number().min(MIN_YEAR).max((new Date).getFullYear()).required(),
    date: Joi.date().min(new Date(MIN_YEAR)).required(),
    home: Joi.string().required(),
    away: Joi.string().required(),
};

function SimpleGame(attributes) {
    var validatedAttributes = Joi.validate(attributes, schema, { stripUnknown: true });
    if(validatedAttributes.error) {
        throw validatedAttributes.error;
    }

    _.extendOwn(this, validatedAttributes.value);
    Object.freeze(this);
}

SimpleGame.create = function create(attributes) {
    return new SimpleGame(attributes);
};

SimpleGame.getAttributeNames = function getAttributeNames() {
    return Object.keys(schema);
};

SimpleGame.prototype.isHomeTeam = function isHomeTeam(team) {
    return team == this.home;
};

SimpleGame.prototype.getOpposingTeam = function getOpposingTeam(team) {
    return this.isHomeTeam(team) ? this.away : this.home;
};

module.exports = SimpleGame;