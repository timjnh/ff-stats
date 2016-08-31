'use strict';

var _ = require('underscore'),
    Joi = require('joi'),
    Genome = require('./genome');

function GenomeSet(attributes) {
    var validatedAttributes = Joi.validate(attributes, GenomeSet.schema, { stripUnknown: true });
    if(validatedAttributes.error) {
        throw validatedAttributes.error;
    }

    _.extendOwn(this, validatedAttributes.value);
    Object.freeze(this);
}

GenomeSet.schema = {
    genomes: Joi.array().items(Genome.schema),
    inputsList: Joi.array().items(Joi.string().min(1)).min(1).required(),
};

GenomeSet.create = function create(attributes) {
    return new GenomeSet(attributes);
};

GenomeSet.prototype.getInputListForGenome = function getInputListForGenome(genome) {
    var genomeInputs = [];
    for(var i = 0; i < this.inputsList.length; ++i) {
        if(genome.isChromosomeActive(i)) {
            genomeInputs.push(this.inputsList[i]);
        }
    }
    return genomeInputs;
};

module.exports = GenomeSet;