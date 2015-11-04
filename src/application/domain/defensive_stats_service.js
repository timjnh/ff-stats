'use strict';

var _ = require('underscore'),
    PlayerStats = require('./player_stats');

function DefensiveStatsService() {}

DefensiveStatsService.prototype.buildPlayerStatsForTeamFromHomeAndAway = function buildPlayerStatsForTeamFromHomeAndAway(teamStats, opponentStats) {
    var stats = PlayerStats.create({});

    _.values(teamStats.defense).forEach(function addStatsForDefenseEvent(event) {
        stats.add({
            sacks: event.sk,
            interceptions: event.int
        });
    });

    _.values(opponentStats.fumbles).forEach(function addStatsForFumbleEvent(event) {
        stats.add({
            fumbleRecoveries: event.lost
        });
    });

    _.values(opponentStats.rushing).forEach(function addStatsForRushingEvent(event) {
        stats.add({
            rushingTDsAllowed: event.tds
        });
    });

    _.values(opponentStats.receiving).forEach(function addStatsForPassingEvent(event) {
        stats.add({
            passingTDsAllowed: event.tds
        });
    });

    stats.add({
        passingYardsAllowed: opponentStats.team.pyds,
        rushingYardsAllowed: opponentStats.team.ryds
    });

    return stats;
};

module.exports = new DefensiveStatsService();