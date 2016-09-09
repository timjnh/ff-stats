'use strict';

var _ = require('underscore'),
    Genome = require('./genome'),
    GenomeSet = require('./genome_set');

var CROSSOVER_RATE = 0.7,
    MUTATION_RATE = 0.001;

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

GenomeService.prototype.buildNextGeneration = function buildNextGeneration(genomeSet) {
    var parentGenomes,
        childGenomes,
        nextGenerationGenomes = [];

    while(nextGenerationGenomes.length < genomeSet.genomes.length) {
        parentGenomes = selectParents(genomeSet.genomes);
        childGenomes = breed(parentGenomes);
        nextGenerationGenomes = nextGenerationGenomes.concat(childGenomes);
    }

    return GenomeSet.create({ inputsList: genomeSet.inputsList, genomes: nextGenerationGenomes });
};

function selectParents(genomes) {
    var firstParent,
        secondParent;

    firstParent = selectParent(genomes);

    // little bit o' brute force...
    do {
        secondParent = selectParent(genomes);
    } while(_.isEqual(secondParent.chromosomes, firstParent.chromosomes))

    console.log('Selecting parents ' + genomes.indexOf(firstParent) + ' (' + firstParent.fitness + ') and ' + genomes.indexOf(secondParent) + ' (' + secondParent.fitness + ')');

    return [firstParent, secondParent];
}

function selectParent(genomes) {
    var total = genomes.reduce(function(total, genome) { return total + genome.fitness; }, 0),
        randomValue = Math.random() * total,
        currentTotal = 0;

    for(var i = 0; i < genomes.length; ++i) {
        currentTotal += genomes[i].fitness;
        if(currentTotal > randomValue) {
            break;
        }
    }

    return genomes[i];
}

function breed(parents) {
    return crossover(parents).map(mutate);
}

function crossover(parentGenomes) {
    var crossoverChromosomes1 = [],
        crossoverChromosomes2 = [],
        childGenome1 = parentGenomes[0].setFitness(undefined),
        childGenome2 = parentGenomes[1].setFitness(undefined),
        crossoverBit = Math.floor(Math.random() * childGenome1.chromosomes.length);

    if(Math.random() > CROSSOVER_RATE) {
        return [childGenome1, childGenome2];
    }

    for(var i = 0; i < childGenome1.chromosomes.length; ++i) {
        if(i < crossoverBit) {
            crossoverChromosomes1.push(childGenome1.chromosomes[i]);
            crossoverChromosomes2.push(childGenome2.chromosomes[i]);
        } else {
            crossoverChromosomes1.push(childGenome2.chromosomes[i]);
            crossoverChromosomes2.push(childGenome1.chromosomes[i]);
        }
    }

    return [
        childGenome1.setChromosomes(crossoverChromosomes1),
        childGenome2.setChromosomes(crossoverChromosomes2)
    ];
}

function mutate(genome) {
    var mutatedChromosomes = [];
    for(var i = 0; i < genome.chromosomes.length; ++i) {
        mutatedChromosomes.push(Math.random() < MUTATION_RATE ? genome.chromosomes[i] ^ 1 : genome.chromosomes[i]);
    }
    return genome.setChromosomes(mutatedChromosomes);
}

module.exports = new GenomeService();