'use strict';

var _ = require('underscore'),
    Joi = require('joi');

function PlayerBO(attributes) {
    var validatedAttributes = Joi.validate(attributes, PlayerBO.schema, { stripUnknown: true });
    if(validatedAttributes.error) {
        throw validatedAttributes.error;
    }

    _.extendOwn(this, validatedAttributes.value);
    Object.freeze(this);
};

PlayerBO.schema = {
    name: Joi.string().min(1).required(),
    team: Joi.string().min(1).required()
};

PlayerBO.create = function create(attributes) {
    return new PlayerBO(attributes);
};

module.exports = PlayerBO;