'use strict';

var q = require('q'),
    logger = require('./lib/logger'),
    bootstrap = require('./bootstrap'),
    inputsService = require('./application/domain/inputs/inputs_service'),
    playerRepository = require('./port/player/player_repository'),
    EvolutionService = require('./application/domain/evolution/evolution_service'),
    LSTMStrategy = require('./application/domain/network/strategies/lstm_strategy');

var playerName = 'R Cobb',
    teamName = 'packers';

// the strategy here is to generate/train a network based on data from half our games and then run
// projections against the second half of our games.  we then gauge fitness based on standard deviation
// from the actual

bootstrap.start()
    .then(function findPlayer() {
        return playerRepository.findOneByNameAndTeam(playerName, teamName);
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
                    genomeCount: 32,
                    strategy: LSTMStrategy.NAME
                }
            ),
            evolutionPromiseChain = q.when();

        for(var i = 0; i < 1000; ++i) {
            evolutionPromiseChain = evolutionPromiseChain.then(function() {
                return evolutionService.evolve()
                    .then(showLastGeneration.bind(evolutionService))
                    .then(function displayFittestGenome() {
                        console.log("\n\n" + 'Witness the fitness:');
                        console.log(evolutionService.getMaximumGenomeFitness() + ': ' + evolutionService.getFittestInputList().join(', '));
                    });
            });
        }

        return evolutionPromiseChain;
    })
    .catch(function handleError(err) {
        logger.error(err);
    })
    .finally(function stopEverything() {
        return bootstrap.stop();
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
        console.log(genomeRecords[j].fitness + ': ', genomeRecords[j].inputsList.join(', '));
    }
}
