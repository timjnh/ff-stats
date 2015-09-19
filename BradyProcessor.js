'use strict';

var _ = require('underscore'),
    q = require('q'),
    synaptic = require('synaptic'),
    bootstrap = require('./Bootstrap'),
    gameRepository = require('./port/game/GameRepository'),
    fantasyPointService = require('./domain/FantasyPointService'),
    gameEventService = require('./domain/GameEventService'),
    PlayerStats = require('./domain/PlayerStats'),
    Player = require('./domain/Player'),
    PlayerGame = require('./domain/PlayerGame'),
    playerRepository = require('./port/player/PlayerRepository'),
    trainingService = require('./domain/TrainingService');

var PATRIOTS = 'patriots',
    BRADY = 'T Brady',
    PACKERS = 'packers',
    RODGERS = 'A Rodgers';

function addGameToPlayer(playerName, game, playerStats) {
    var points = fantasyPointService.calculatePointsForPlayerStats(playerStats),
        playerTeam = playerName == BRADY ? PATRIOTS : PACKERS;

    return playerRepository.findOneByNameAndTeam(playerName, playerTeam)
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

function extractPlayersFromGame(game) {
    var playerStats = {};
    //playerStats[BRADY] = PlayerStats.create({});
    playerStats[RODGERS] = PlayerStats.create({});

    _.values(game.stats.drives).forEach(function(drive) {
        _.values(drive.plays).forEach(function(play) {
            var event;

            for(var j in play.players) {
                for(var k in play.players[j]) {
                    event = play.players[j][k];

                    if(playerStats.hasOwnProperty(event.playerName)) {
                        playerStats[event.playerName].add(gameEventService.buildPlayerStatsFromEvent(event));
                    }
                }
            }
        });
    });

    var playerPromises = [];
    for(var k in playerStats) {
        // TODO - hack to work around the fact that I create stats for a player even if their team
        // didn't play in a particular game
        if(playerStats[k].isEmpty()) {
            continue;
        }

        playerPromises.push(addGameToPlayer(k, game, playerStats[k]));
    }
    return q.all(playerPromises);
}

function buildNetworkForPlayer(player) {
    return trainingService.getTrainingSetsForPlayer(player)
        .then(function buildNetworkFromTrainingSets(trainingSets) {
            var network = new synaptic.Architect.Perceptron(trainingSets[0].input.length, trainingSets[0].input.length + 1, 1),
                trainer = new synaptic.Trainer(network);

            trainer.train(trainingSets, { rate: 0.01, iterations: 20000 });

            return player.setNetwork(network);
        });
}

bootstrap.start()
    .then(function findGames() {
        return q.all([/*gameRepository.findGamesWithTeam(PATRIOTS), */gameRepository.findGamesWithTeam(PACKERS)])
            .then(function mergeGames(games) {
                return _.flatten(games);
            });
    })
    .then(function skipGamesWithoutStats(games) {
        return _.filter(games, function(game) { return game.hasOwnProperty('stats'); });
    })
    .then(function extractPlayers(games) {
        // this needs to be done sequentially so we're not fighting over player objects
        var extractPlayersChain = q.when();
        games.map(function buildExtractPlayersPromiseChain(game) {
            extractPlayersChain = extractPlayersChain.then(extractPlayersFromGame.bind(this, game));
        });
        return extractPlayersChain;
    })
    .then(function findAllPlayers() {
        return playerRepository.findAll();
    })
    .then(function buildNetworks(players) {
        var playersWithNetworks = players.map(buildNetworkForPlayer);
        return q.all(playersWithNetworks);
    })
    .then(function tryNetwork(playersWithNetworks) {
        playersWithNetworks.forEach(function tryIt(player) {
            if(player.name == BRADY) {
                console.log(player.name + ': ' + (player.network.activate([0, 17.7 / 100, 19.38 / 100, 27.62 / 100]) * 100));
            } else if(player.name == RODGERS) {
                console.log(player.name + ': ' + (player.network.activate([1, 27.88 / 100, 24.92 / 100, 23.06 / 100]) * 100));
            }
        });
    })
    .then(function() {
        console.log('All done!');
    })
    .finally(bootstrap.stop.bind(bootstrap))
    .done();