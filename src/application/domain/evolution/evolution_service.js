'use strict';

var q = require('q'),
    assert = require('assert'),
    logger = require('../../../lib/logger'),
    genomeService = require('./genome_service'),
    playerNetworkWorkerService = require('../network/player_network_worker_service'),
    projectionsWorkerService = require('../network/projections_worker_service'),
    GenomeRepository = require('../../../port/genome/genome_repository'),
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

    this.genomeRepository = new GenomeRepository(player, inputsList, options.strategy);
}

EvolutionService.prototype.evolve = function evolve() {
    var _this = this;
    return findOrGenerateFitnessValuesForGenomes.bind(this)()
        .then(function buildNextGeneration(genomes) {
            var previousGenerationGenomeSet = GenomeSet.create({ inputsList: _this.genomeSet.inputsList, genomes: genomes });
            _this.lastGenomeSet = previousGenerationGenomeSet;

            _this.genomeSet = genomeService.buildNextGeneration(previousGenerationGenomeSet);
            return _this.genomeSet;
        });
};

function findOrGenerateFitnessValuesForGenomes() {
    var _this = this,
        genomePromises;

    genomePromises = this.genomeSet.genomes.map(function findOrGenerateFitnessValuesForGenome(genome) {
        var genomeInputsList = _this.genomeSet.getInputListForGenome(genome);

        return _this.genomeRepository.findOneByChromosomes(genomeInputsList)
            .then(function generateGenomeIfNotExists(foundGenome) {
                if(foundGenome && foundGenome.fitness) {
                    return foundGenome;
                } else {
                    return calculateGenomeFitness.bind(_this)(genome)
                        .then(function saveGenome(updatedGenome) {
                            return _this.genomeRepository.save(updatedGenome);
                        });
                }
            });
    });

    return q.all(genomePromises);
}

function calculateGenomeFitness(genome) {
    var _this = this,
        genomeInputsList = this.genomeSet.getInputListForGenome(genome);

    if(!this.lastTrainingGame.hasAllInputs(genomeInputsList)) {
        throw new Error('Not all inputs in ' + genomeInputsList.join(', ') + ' exist for player "' + this.player.name + '" of "' + this.player.team + '" for week ' + this.lastTrainingGame.week + ' of ' + this.lastTrainingGame.year);
    }

    return playerNetworkWorkerService.buildNetworkUpToGame(
            this.player,
            this.lastTrainingGame,
            genomeInputsList,
            this.options.strategy)
        .then(calculateFitnessValueForNetwork.bind(this))
        .then(function assignFitnessValueToGenome(fitnessValue) {
            var updatedGenome = genome.setFitness(fitnessValue);

            if(!_this.fittestGenome || updatedGenome.fitness > _this.fittestGenome.fitness) {
                _this.fittestGenome = updatedGenome;
            }

            return updatedGenome;
        });
}

function calculateFitnessValueForNetwork(playerNetwork) {
    var startDate = this.lastTrainingGame.getGameDate(),
        endDate = this.playerGames[this.playerGames.length - 1].getGameDate();

    return q.when(projectionsWorkerService.buildProjectionsFromSingleNetwork(playerNetwork, this.player, this.inputsList, startDate, endDate))
        .then(calculateFitnessFromProjections);
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