'use strict';

var _ = require('underscore'),
    q = require('q'),
    bootstrap = require('./Bootstrap'),
    gameRepository = require('./port/game/GameRepository'),
    statsRepository = require('./port/stats/StatsRepository'),
    Game = require('./domain/Game');

function findGamesInNeedOfStats() {
    return gameRepository.findGamesWithoutStats()
        .then(function removeGamesThatHaveNotBeenPlayedYet(games) {
            return _.filter(games, function hasBeenPlayed(game) { return game.hasBeenPlayed(); });
        });
}

function retrieveStatsForGame(game) {
    console.log('Retrieving stats for game with eid ' + game.eid);
    return statsRepository.findByEid(game.eid);
}

function saveStatsWithGame(game, stats) {
    return gameRepository.save(game.add({ stats: stats }));
}

bootstrap.start()
    .then(findGamesInNeedOfStats)
    .then(function(games) {
        var game,
            retrieveChain = q.when();

        for(var i in games) {
            game = games[i];

            retrieveChain = retrieveChain.then(retrieveStatsForGame.bind(this, game))
                .then(saveStatsWithGame.bind(this, game))
                .then(function addDelay() {
                    return q.delay(5000);
                });
        }

        return retrieveChain;
    })
    .then(function() {
        console.log('All done!');
    })
    .finally(bootstrap.stop.bind(bootstrap))
    .done();