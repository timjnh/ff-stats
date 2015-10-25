'use strict';

var _ = require('underscore'),
    Joi = require('joi');

function TrainingSet(attributes) {
    var validatedAttributes = Joi.validate(attributes, TrainingSet.schema, { stripUnknown: true });
    if(validatedAttributes.error) {
        throw validatedAttributes.error;
    }

    _.extendOwn(this, validatedAttributes.value);
    Object.freeze(this);
}

TrainingSet.schema = {
    input: Joi.array().items(Joi.number()).min(1).required(),
    output: Joi.array().items(Joi.number()).length(1).required()
};

TrainingSet.create = function create(attributes) {
    return new TrainingSet(attributes);
};

module.exports = TrainingSet;