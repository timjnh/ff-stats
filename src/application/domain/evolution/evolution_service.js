'use strict';

var q = require('q'),
    assert = require('assert'),
    genomeService = require('./genome_service'),
    playerNetworkWorkerService = require('../network/player_network_worker_service'),
    projectionsWorkerService = require('../network/projections_worker_service'),
    GenomeSet = require('./genome_set');

function EvolutionService(player, lastTrainingGame, inputsList, options) {
    assert(typeof options.genomeCount == 'number', 'options.genomeCount must be a number');
    assert(typeof options.strategy == 'string', 'options.strategy must be a string');

    this.player = player;
    this.playerGames = player.getOrderedGames(),
    this.lastTrainingGame = lastTrainingGame;
    this.inputsList = inputsList;
    this.options = options;

    this.lastGenomeSet = null;
    this.genomeSet = genomeService.generateGenomes(inputsList, options.genomeCount);

    this.fittestGenome = null;
}

EvolutionService.prototype.evolve = function evolve() {
    var _this = this;
    return generateNetworks.bind(this)()
        .then(calculateFitnessValuesForNetworks.bind(this))
        .then(assignFitnessValuesToGenomes.bind(this))
        .then(function buildNextGeneration(previousGenerationGenomeSet) {
            _this.lastGenomeSet = previousGenerationGenomeSet;

            _this.genomeSet = genomeService.buildNextGeneration(previousGenerationGenomeSet);
            return _this.genomeSet;
        });
};

function generateNetworks() {
    var _this = this,
        networkPromises = [];

    this.genomeSet.genomes.forEach(function generateNetworkForGenome(genome) {
        var networkPromise,
            genomeInputsList = _this.genomeSet.getInputListForGenome(genome);

        if(!_this.lastTrainingGame.hasAllInputs(genomeInputsList)) {
            throw new Error('Not all inputs in ' + genomeInputsList.join(', ') + ' exist for player "' + _this.player.name + '" of "' + _this.player.team + '" for week ' + _this.lastTrainingGame.week + ' of ' + _this.lastTrainingGame.year);
        }

        networkPromise = playerNetworkWorkerService.buildNetworkUpToGame(
            _this.player,
            _this.lastTrainingGame,
            genomeInputsList,
            _this.options.strategy
        );

        networkPromises.push(networkPromise);
    });

    return q.all(networkPromises);
}

function calculateFitnessValuesForNetworks(playerNetworks) {
    var _this = this,
        fitnessPromises,
        startDate = this.lastTrainingGame.getGameDate(),
        endDate = this.playerGames[this.playerGames.length - 1].getGameDate();

    console.log('Building projections...');

    fitnessPromises = playerNetworks.map(function calculateProjectionForNetwork(playerNetwork) {
        return projectionsWorkerService.buildProjectionsFromSingleNetwork(playerNetwork, _this.player, _this.inputsList, startDate, endDate)
            .then(calculateFitnessFromProjections);
    });

    return q.all(fitnessPromises);
}

function calculateFitnessFromProjections(projections) {
    var totalError = projections.reduce(function(total, projection) {
        if(isNaN(projection.projected)) {
            return total;
        }
        return total + Math.abs(projection.actual - projection.projected);
    }, 0);

    return 1 / (totalError / projections.length);
}

function assignFitnessValuesToGenomes(fitnessValues) {
    var updatedGenomes = [];
    for(var i = 0; i < fitnessValues.length; ++i) {
        updatedGenomes.push(this.genomeSet.genomes[i].setFitness(fitnessValues[i]));

        if(this.fittestGenome == null || this.fittestGenome.fitness < fitnessValues[i]) {
            this.fittestGenome = updatedGenomes[i];
        }
    }

    return GenomeSet.create({ inputsList: this.genomeSet.inputsList, genomes: updatedGenomes });
}

EvolutionService.prototype.getFittestInputList = function getFittestInputList() {
    if(this.fittestGenome == null) {
        return null;
    }

    return this.genomeSet.getInputListForGenome(this.fittestGenome);
};

EvolutionService.prototype.getMaximumGenomeFitness = function getMaximumGenomeFitness() {
    if(this.fittestGenome == null) {
        return null;
    }

    return this.fittestGenome.fitness;
};

module.exports = EvolutionService;