'use strict';

var _ = require('underscore'),
    q = require('q'),
    bootstrap = require('./Bootstrap'),
    gameRepository = require('./port/game/GameRepository'),
    fantasyPointService = require('./domain/FantasyPointService'),
    gameEventService = require('./domain/GameEventService'),
    PlayerStats = require('./domain/PlayerStats'),
    Player = require('./domain/Player'),
    PlayerGame = require('./domain/PlayerGame'),
    playerRepository = require('./port/player/PlayerRepository'),
    inputsService = require('./domain/InputsService');

var PATRIOTS = 'patriots';

function extractPlayersFromGame(game) {
    var playerStats = new PlayerStats(),
        points;

    _.values(game.stats.drives).forEach(function(drive) {
        _.values(drive.plays).forEach(function(play) {
            var event;

            for(var j in play.players) {
                for(var k in play.players[j]) {
                    event = play.players[j][k];

                    // for now we're only dealing with brady
                    if(event.playerName == 'T Brady') {
                        playerStats.add(gameEventService.buildPlayerStatsFromEvent(event));
                    }
                }
            }
        });
    });

    points = fantasyPointService.calculatePointsForPlayerStats(playerStats);

    return playerRepository.findOneByName('T Brady')
        .then(function addGameToPlayer(player) {
            return player.addGame(PlayerGame.create({
                eid: game.eid,
                week: game.week,
                year: game.year,
                points: parseFloat(points.toFixed(1)),
                stats: playerStats
            }));
        })
        .then(function savePlayer(player) {
            return playerRepository.save(player);
        });
}

function buildNetworkForPlayer(player, game) {
    var inputs = inputsService.getInputsForPlayerAndGame(player, game),
        network = new Architect.Perceptron(inputs.length, inputs.length + 1, 1),
        trainer = new Trainer(network),
        trainingSet = { input: inputs, output: [player.points] };

    trainer.train(trainingSet);
}

bootstrap.start()
    .then(function findPatriotsGames() {
        return gameRepository.findGamesWithTeam(PATRIOTS);
    })
    .then(function skipGamesWithoutStats(games) {
        return _.filter(games, function(game) { return game.hasOwnProperty('stats'); });
    })
    .then(function extractPlayer(games) {
        return q.all(games.map(extractPlayersFromGame));
    })
    .then(function findAllPlayers() {
        return playerRepository.findAll();
    })
    .then(function buildNetworks(players) {
        var playersWithNetworks = players.map(buildNetworkForPlayer),
            savePromises = playersWithNetworks.map(playerRepository.save.bind(playerRepository));
        return q.all(savePromises);
    })
    .then(function() {
        console.log('All done!');
    })
    .finally(bootstrap.stop.bind(bootstrap))
    .done();