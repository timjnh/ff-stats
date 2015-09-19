'use strict';

var _ = require('underscore'),
    assert = require('assert'),
    Joi = require('joi'),
    Player = require('./Player');

var MIN_YEAR = 1900;

var schema = {
    _id: Joi.object().required(),
    eid: Joi.string().min(1).required(),
    week: Joi.number().min(1).max(16).required(),
    year: Joi.number().min(MIN_YEAR).max((new Date).getFullYear()).required(),
    date: Joi.date().min(new Date(MIN_YEAR)).required(),
    home: Joi.string().required(),
    away: Joi.string().required(),
    homeScore: Joi.number().allow(null),
    awayScore: Joi.number().allow(null),
    stats: Joi.object().optional()
};

function Game(attributes) {
    var validatedAttributes = Joi.validate(attributes, schema, { stripUnknown: true });
    if(validatedAttributes.error) {
        throw validatedAttributes.error;
    }

    _.extendOwn(this, validatedAttributes.value);
    Object.freeze(this);
}

Game.create = function create(attributes) {
    return new Game(attributes);
};

Game.prototype.add = function add(attributes) {
    return Game.create(_.extend(_.clone(this), attributes));
};

Game.prototype.hasBeenPlayed = function hasBeenPlayed() {
    return this.date < new Date();
};

Game.prototype.isHomeTeam = function isHomeTeam(team) {
    return team == this.home;
};

module.exports = Game;