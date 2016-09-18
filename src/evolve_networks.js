'use strict';

var args,
    q = require('q'),
    _ = require('underscore'),
    logger = require('./lib/logger'),
    bootstrap = require('./bootstrap'),
    inputsService = require('./application/domain/inputs/inputs_service'),
    workerService = require('./lib/worker/worker_service'),
    playerRepository = require('./port/player/player_repository'),
    EvolutionService = require('./application/domain/evolution/evolution_service'),
    networkStrategyFactory = require('./application/domain/network/strategies/network_strategy_factory'),
    LSTMStrategy = require('./application/domain/network/strategies/lstm_strategy');

args = require('yargs')
    .usage('Usage: npm run evolve-networks[-nm] -- -p player -t team [options]')
    .strict()
    .help('h')
    .alias('h', 'help')
    .describe('player', 'Name of player or players to evolve networks for')
    .alias('p', 'player')
    .demand('player')
    .describe('team', 'Name of team for whom we\'re evolving networks')
    .alias('t', 'team')
    .demand('team')
    .describe('strategy', 'Network strategy to use')
    .choices('strategy', networkStrategyFactory.getStrategyNames())
    .default('strategy', LSTMStrategy.NAME)
    .alias('s', 'strategy')
    .describe('genome-count', 'Number of genomes to generate')
    .default('genome-count', 500)
    .alias('c', 'genome-count')
    .describe('generations', 'Number of generations to run')
    .default('generations', 100)
    .alias('g', 'generations')
    .argv;

// the strategy here is to generate/train a network based on data from half our games and then run
// projections against the second half of our games.  we then gauge fitness based on standard deviation
// from the actual

bootstrap.start()
    .then(function startWorkerService() {
        return workerService.start();
    })
    .then(function findPlayer() {
        return playerRepository.findOneByNameAndTeam(args.player, args.team);
    })
    .then(function evolve(player) {
        var inputsList = inputsService.getInputsListForPosition(player.position),
            playerGames = player.getOrderedGames(),
            lastTrainingGame = playerGames[Math.floor(playerGames.length / 2)],
            evolutionService = new EvolutionService(
                player,
                lastTrainingGame,
                inputsList,
                {
                    genomeCount: args.genomeCount,
                    strategy: args.strategy
                }
            ),
            evolutionPromiseChain = q.when();

        _.range(1, args.generations).forEach(function buildEvolutionPromiseChain(generation) {
            evolutionPromiseChain = evolutionPromiseChain.then(function() {
                logger.info('Starting generation ' + generation + '...');
                return evolutionService.evolve()
                    .then(showLastGeneration.bind(evolutionService))
                    .then(function displayFittestGenome() {
                        logger.info('Witness the fitness:' + evolutionService.getMaximumGenomeFitness() + ': ' + evolutionService.getFittestInputList().join(', '));
                    });
            });
        });

        return evolutionPromiseChain;
    })
    .catch(function handleError(err) {
        logger.error(err);
    })
    .finally(function stopEverything() {
        return workerService.stop()
            .then(bootstrap.stop.bind(bootstrap));
    })
    .done();

function showLastGeneration() {
    var genomeSet = this.lastGenomeSet,
        genomeRecords = [];

    for(var i = 0; i < genomeSet.genomes.length; ++i) {
        genomeRecords.push({
            fitness: genomeSet.genomes[i].fitness,
            inputsList: genomeSet.getInputListForGenome(genomeSet.genomes[i])
        });
    }

    genomeRecords.sort(function compareGenomeRecords(a, b) {
        if(a.fitness < b.fitness) {
            return -1;
        } else if(a.fitness > b.fitness) {
            return 1;
        } else {
            return 0;
        }
    });

    for(var j = 0; j < genomeRecords.length; ++j) {
        logger.info(genomeRecords[j].fitness + ': ', genomeRecords[j].inputsList.join(', '));
    }
}
