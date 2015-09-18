'use strict';

var _ = require('underscore'),
    bootstrap = require('./Bootstrap'),
    gameRepository = require('./port/game/GameRepository'),
    fantasyPointService = require('./domain/FantasyPointService'),
    gameEventService = require('./domain/GameEventService'),
    PlayerStats = require('./domain/PlayerStats');

var PATRIOTS = 'patriots';

function calculateBradyStats(game) {
    var playerStats = new PlayerStats(),
        points;

    _.values(game.stats.drives).forEach(function(drive) {
        _.values(drive.plays).forEach(function(play) {
            var event;

            for(var j in play.players) {
                for(var k in play.players[j]) {
                    event = play.players[j][k];

                    if(event.playerName == 'T Brady') {
                        playerStats.add(gameEventService.buildPlayerStatsFromEvent(event));
                    }
                }
            }
        });
    });

    points = fantasyPointService.calculatePointsForPlayerStats(playerStats);
    return parseFloat(points.toFixed(1));
}

bootstrap.start()
    .then(function findPatriotsGames() {
        return gameRepository.findGamesWithTeam(PATRIOTS);
    })
    .then(function skipGamesWithoutStats(games) {
        return _.filter(games, function(game) { return game.hasOwnProperty('stats'); });
    })
    .then(function calculateFantasyPoints(games) {
        var fantasyPoints = games.map(calculateBradyStats);
    })
    .then(function() {
        console.log('All done!');
    })
    .finally(bootstrap.stop.bind(bootstrap))
    .done();