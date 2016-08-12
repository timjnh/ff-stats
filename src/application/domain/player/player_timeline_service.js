'use strict';

var logger = require('../../../lib/logger'),
    PlayerGame = require('./player_game'),
    PlayerStats = require('./player_stats'),
    simpleGameRepository = require('../../../port/game/simple_game_repository');

function PlayerTimelineService() {}

function addGameToPlayer(game, player) {
    return player.addGame(PlayerGame.create({
        eid: game.eid,
        week: game.week,
        year: game.year,
        date: game.date,
        opponent: game.getOpposingTeam(player.team),
        points: 0,
        stats: PlayerStats.create({}),
        inputs: {}
    }));
}

PlayerTimelineService.prototype.addMissingGamesToPlayer = function addMissingGamesToPlayer(player) {
    var addMissingGames = false,
        lastGame = null,
        orderedGames = player.getOrderedGames();

    if(orderedGames.length < 2) {
        return player;
    }

    return simpleGameRepository.findOrderedGamesForTeam(player.team)
        .then(function findMissingGames(allOrderedGames) {
            for(var i = 0; i < allOrderedGames.length; ++i) {
                if(!orderedGames.length) {
                    // we're out of games attached to this player.  if there are more team games we want to add
                    // at most one more to the player.  we want to avoid adding tons of games to the player if
                    // they left the team but we want to be able to project one game into the future.
                    if(lastGame && lastGame.hasStats()) {
                        logger.debug('Adding game with eid "' + allOrderedGames[i].eid + ' to player ' + player.name);
                        player = addGameToPlayer(allOrderedGames[i], player);
                    }

                    break;
                }

                if(allOrderedGames[i].eid == orderedGames[0].eid) {
                    addMissingGames = true;
                    lastGame = orderedGames.shift();
                } else if(addMissingGames) {
                    if(orderedGames[0].eid == allOrderedGames[i].eid) {
                        lastGame = orderedGames.shift();
                    } else {
                        lastGame = null;

                        logger.debug('Adding game with eid "' + allOrderedGames[i].eid + ' to player ' + player.name);
                        player = addGameToPlayer(allOrderedGames[i], player);
                    }
                }
            }

            return player;
        });
};

module.exports = new PlayerTimelineService();