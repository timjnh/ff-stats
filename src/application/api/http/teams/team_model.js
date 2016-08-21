'use strict';

var _ = require('underscore'),
    Joi = require('joi');

function TeamModel(attributes) {
    var validatedAttributes = Joi.validate(attributes, TeamModel.schema, { stripUnknown: true });
    if(validatedAttributes.error) {
        throw validatedAttributes.error;
    }

    _.extendOwn(this, validatedAttributes.value);
    Object.freeze(this);
};

TeamModel.schema = {
    name: Joi.string().min(1).required()
};

TeamModel.create = function create(attributes) {
    return new TeamModel(attributes);
};

module.exports = TeamModel;