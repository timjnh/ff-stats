'use strict';

var _ = require('underscore'),
    Joi = require('joi');

function Genome(attributes) {
    var validatedAttributes = Joi.validate(attributes, Genome.schema, { stripUnknown: true });
    if(validatedAttributes.error) {
        throw validatedAttributes.error;
    }

    _.extendOwn(this, validatedAttributes.value);
    Object.freeze(this);
}

Genome.schema = {
    chromosomes: Joi.array().items(
        Joi.number().valid(0, 1)
    ).required()
};

Genome.create = function create(attributes) {
    return new Genome(attributes);
};

Genome.prototype.isChromosomeActive = function isChromosomeActive(index) {
    return this.chromosomes[index] === 1;
};

module.exports = Genome;