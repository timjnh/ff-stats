'use strict';

var _ = require('underscore'),
    PlayerStats = require('./player_stats');

function DefensiveStatsService() {}

DefensiveStatsService.prototype.buildPlayerStatsFromOpponentScore = function buildPlayerStatsFromOpponentScore(score) {
    if(score == 0) {
        return PlayerStats.create({ pointsAllowed0: 1 });
    } else if(score < 7) {
        return PlayerStats.create({ pointsAllowedLessThan7: 1 });
    } else if(score < 14) {
        return PlayerStats.create({ pointsAllowedLessThan14: 1 });
    } else if(score < 18) {
        return PlayerStats.create({ pointsAllowedLessThan18: 1 });
    } else if(score < 28) {
        return PlayerStats.create({ pointsAllowedLessThan28: 1 });
    } else if(score < 35) {
        return PlayerStats.create({ pointsAllowedLessThan35: 1 });
    } else if(score < 46) {
        return PlayerStats.create({ pointsAllowedLessThan46: 1 });
    } else {
        return PlayerStats.create({ pointsAllowed46OrMore: 1 });
    }
};

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