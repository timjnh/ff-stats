'use strict';

var _ = require('underscore'),
    Joi = require('joi');

function InputModel(attributes) {
    var validatedAttributes = Joi.validate(attributes, InputModel.schema, { stripUnknown: true });
    if(validatedAttributes.error) {
        throw validatedAttributes.error;
    }

    _.extendOwn(this, validatedAttributes.value);
    Object.freeze(this);
};

InputModel.schema = {
    name: Joi.string().min(1).required()
};

InputModel.create = function create(attributes) {
    return new InputModel(attributes);
};

module.exports = InputModel;