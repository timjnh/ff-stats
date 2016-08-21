'use strict';

var _ = require('underscore'),
    Joi = require('joi');

function SimpleTeam(attributes) {
    var validatedAttributes = Joi.validate(attributes, SimpleTeam.schema, { stripUnknown: true });
    if(validatedAttributes.error) {
        throw validatedAttributes.error;
    }

    _.extendOwn(this, validatedAttributes.value);
    Object.freeze(this);
}

SimpleTeam.schema = {
    _id: [Joi.object(), Joi.string().length(24)],
    name: Joi.string().min(1).required()
};

SimpleTeam.getAttributeNames = function getAttributeNames() {
    return Object.keys(SimpleTeam.schema);
};

SimpleTeam.create = function create(attributes) {
    return new SimpleTeam(attributes);
};

module.exports = SimpleTeam;