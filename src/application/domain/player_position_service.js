'use strict';

var PlayerPosition = require('./player_position');

function PlayerPositionService() {}

PlayerPositionService.prototype.calculatePlayerPosition = function calculatePlayerPosition(player) {
    var receivingYards,
        rushingYards,
        passingYards;

    if(player.getStatsTotal('sacks') > 0 ||
        player.getStatsTotal('interceptions') > 0 ||
        player.getStatsTotal('passingYardsAllowed') > 0 ||
        player.getStatsTotal('rushingYardsAllowed')) {
        return PlayerPosition.DEFENSE;
    } else if(player.getStatsTotal('fieldGoalsMissed') > 0 ||
        player.getStatsTotal('fieldGoalsMade50Plus') > 0 ||
        player.getStatsTotal('fieldGoalsMade40Plus') > 0 ||
        player.getStatsTotal('fieldGoalsMade0Plus') > 0) {
        return PlayerPosition.KICKER;
    }

    receivingYards = player.getStatsTotal('receivingYards');
    rushingYards = player.getStatsTotal('rushingYards');
    passingYards = player.getStatsTotal('passingYards');

    if(passingYards > rushingYards && passingYards > receivingYards) {
        return PlayerPosition.QB;
    } else if(receivingYards > rushingYards) {
        return PlayerPosition.WR;
    } else {
        return PlayerPosition.RB;
    }
};

module.exports = new PlayerPositionService();