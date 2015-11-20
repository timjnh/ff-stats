'use strict';

var logger = require('../../../lib/logger'),
    PlayerGame = require('./player_game'),
    PlayerStats = require('./player_stats'),
    simpleGameRepository = require('../../../port/game/simple_game_repository');

function PlayerTimelineService() {}

PlayerTimelineService.prototype.addMissingGamesToPlayer = function addMissingGamesToPlayer(player) {
    var addMissingGames = false,
        orderedGames = player.getOrderedGames();

    if(orderedGames.length < 2) {
        return player;
    }

    return simpleGameRepository.findOrderedGamesForTeam(player.team)
        .then(function findMissingGames(allOrderedGames) {
            for(var i = 0; i < allOrderedGames.length && orderedGames.length; ++i) {
                if(allOrderedGames[i].eid == orderedGames[0].eid) {
                    addMissingGames = true;
                    orderedGames.shift();
                } else if(addMissingGames) {
                    if(orderedGames[0].eid == allOrderedGames[i].eid) {
                        orderedGames.shift();
                    } else {
                        logger.debug('Adding game with eid "' + allOrderedGames[i].eid + ' to player ' + player.name);

                        player = player.addGame(PlayerGame.create({
                            eid: allOrderedGames[i].eid,
                            week: allOrderedGames[i].week,
                            year: allOrderedGames[i].year,
                            opponent: allOrderedGames[i].getOpposingTeam(player.team),
                            points: 0,
                            stats: PlayerStats.create({}),
                            inputs: {}
                        }));
                    }
                }
            }

            return player;
        });
};

module.exports = new PlayerTimelineService();