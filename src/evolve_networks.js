'use strict';

var q = require('q'),
    _ = require('underscore'),
    logger = require('./lib/logger'),
    bootstrap = require('./bootstrap'),
    math = require('mathjs'),
    inputsService = require('./application/domain/inputs/inputs_service'),
    playerRepository = require('./port/player/player_repository'),
    playerNetworkService = require('./application/domain/network/player_network_service'),
    projectionsService = require('./application/domain/network/projections_service'),
    genomeService = require('./application/domain/evolution/genome_service');

var playerName = 'L Blount',
    teamName = 'patriots',
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

        playerNetworks.map(function calculateProjectionForNetwork(playerNetwork) {
            var projections = projectionsService.buildProjectionsFromSingleNetwork(playerNetwork, player, inputsList, startDate, endDate);
            fitnessValues.push(calculateStandardDeviationFromProjections(projections));
        });

        return fitnessValues
    })
    .then(function displayFitnesses(fitnessValues) {
        console.log(fitnessValues);
    })
    .catch(function handleError(err) {
        logger.error(err);
    })
    .finally(function stopEverything() {
        return bootstrap.stop();
    })
    .done();


function calculateStandardDeviationFromProjections(projections) {
    var errors = projections.map(function calculateError(projection) {
        return projection.actual - projection.projected;
    });

    // first value can be NaN if this was the player's first game.  if there are any after that, it's bad
    if(isNaN(errors[0])) {
        errors.shift();
    }
    if(_.filter(errors, isNaN).length > 0) {
        throw 'Unexpected NaN value when calculating standard deviation for projections!';
    }

    return math.std(errors);
}
