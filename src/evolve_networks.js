'use strict';

var q = require('q'),
    logger = require('./lib/logger'),
    bootstrap = require('./bootstrap'),
    inputsService = require('./application/domain/inputs/inputs_service'),
    playerRepository = require('./port/player/player_repository'),
    playerNetworkService = require('./application/domain/network/player_network_service'),
    projectionsService = require('./application/domain/network/projections_service'),
    genomeService = require('./application/domain/evolution/genome_service'),
    GenomeSet = require('./application/domain/evolution/genome_set');

var playerName = 'R Cobb',
    teamName = 'packers',
    genomeCount = 32,
    strategy = require('./application/domain/network/strategies/perceptron_strategy').NAME;

var genomeSet,
    inputsList,
    player,
    playerGames,
    middlePlayerGame;

// the strategy here is to generate/train a network based on data from half our games and then run
// projections against the second half of our games.  we then gauge fitness based on standard deviation
// from the actual

bootstrap.start()
    .then(function findPlayer() {
        return playerRepository.findOneByNameAndTeam(playerName, teamName);
    })
    .then(function buildNetworksForGame(_player) {
        var inputs,
            networkPromises = [];

        player = _player;

        inputs = inputsService.getInputsForPosition(player.position);
        inputsList = inputs.map(function(input) { return input.getName(); });

        playerGames = player.getOrderedGames();
        middlePlayerGame = playerGames[Math.floor(playerGames.length / 2)];

        genomeSet = genomeService.generateGenomes(inputsList, genomeCount);

        genomeSet.genomes.forEach(function generateNetworkForGenome(genome) {
            var networkPromise,
                genomeInputsList = genomeSet.getInputListForGenome(genome);

            if(!middlePlayerGame.hasAllInputs(genomeInputsList)) {
                throw new Error('Not all inputs in ' + genomeInputsList.join(', ') + ' exist for player "' + playerName + '" of "' + teamName + '" for week ' + middlePlayerGame.week + ' of ' + middlePlayerGame.year);
            }

            networkPromise = playerNetworkService.buildNetworkUpToGame(
                player,
                middlePlayerGame,
                genomeInputsList,
                strategy
            );

            networkPromises.push(networkPromise);
        });

        return q.all(networkPromises);
    })
    .then(function calculateNetworkProjections(playerNetworks) {
        var fitnessValues = [],
            startDate = middlePlayerGame.getGameDate(),
            endDate = playerGames[playerGames.length - 1].getGameDate();

        console.log('Building projections...');

        playerNetworks.map(function calculateProjectionForNetwork(playerNetwork) {
            var projections = projectionsService.buildProjectionsFromSingleNetwork(playerNetwork, player, inputsList, startDate, endDate);
            fitnessValues.push(calculateFitnessFromProjections(projections));
        });

        return fitnessValues
    })
    .then(function assignFitnessValuesToGenomes(fitnessValues) {
        var updatedGenomes = [];
        for(var i = 0; i < fitnessValues.length; ++i) {
            updatedGenomes.push(genomeSet.genomes[i].setFitness(fitnessValues[i]));
        }
        return GenomeSet.create({ inputsList: genomeSet.inputsList, genomes: updatedGenomes });
    })
    .then(function buildNextGeneration(previousGenerationGenomeSet) {
        return genomeService.buildNextGeneration(previousGenerationGenomeSet);
    })
    .then(function showNextGeneration(nextGenerationGenomeSet) {
        console.log(JSON.stringify(nextGenerationGenomeSet));
    })
    .catch(function handleError(err) {
        logger.error(err);
    })
    .finally(function stopEverything() {
        return bootstrap.stop();
    })
    .done();


function calculateFitnessFromProjections(projections) {
    var totalError = projections.reduce(function(total, projection) {
        if(isNaN(projection.projected)) {
            return total;
        }
        return total + (projection.actual - projection.projected);
    }, 0);

    return Math.abs(1 / (totalError / projections.length));
}
