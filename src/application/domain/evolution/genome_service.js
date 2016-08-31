'use strict';

var _ = require('underscore'),
    Genome = require('./genome'),
    GenomeSet = require('./genome_set');

function GenomeService() {}

GenomeService.prototype.generateGenomes = function generateGenomes(inputsList, count) {
    var genomes = [];

    while(genomes.length < count) {
        genomes.push(generateGenome(inputsList));

        genomes = _.uniq(genomes, false, function cmpValue(genome) { return JSON.stringify(genome.chromosomes); });
    }

    return GenomeSet.create({ genomes: genomes, inputsList: inputsList });
};

function generateGenome(inputsList) {
    var chromosomes = [];

    for(var i = 0; i < inputsList.length; ++i) {
        chromosomes.push(Math.round(Math.random()));
    }

    return Genome.create({ chromosomes: chromosomes });
}

module.exports = new GenomeService();