'use strict';

var _ = require('underscore'),
    Joi = require('joi');

function Projection(attributes) {
    var validatedAttributes = Joi.validate(attributes, Projection.schema, { stripUnknown: true });
    if(validatedAttributes.error) {
        throw validatedAttributes.error;
    }

    _.extendOwn(this, validatedAttributes.value);
    Object.freeze(this);
    Object.freeze(this.player);
    Object.freeze(this.game);
}

Projection.schema = {
    projected: Joi.number().optional(),
    actual: Joi.number().optional(),
    player: Joi.object({
        name: Joi.string().min(1).required(),
        team: Joi.string().min(1).required()
    }).required(),
    game: Joi.object({
        eid: Joi.string().min(1).required(),
        week: Joi.number().required(),
        year: Joi.number().required()
    }).required(),
};

Projection.create = function create(attributes) {
    return new Projection(attributes);
};

module.exports = Projection;