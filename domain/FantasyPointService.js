'use strict';

var assert = require('assert');

function FantasyPointService() {
    this.pointsPerRushingYard = 0.1;
    this.pointsPerRushingTD = 6;

    this.pointsPerPassingYard = 0.04;
    this.pointsPerPassingTD = 4;

    this.pointsPerFumbleLost = -2;
    this.pointsPerInterceptionLost = -2;
};

FantasyPointService.prototype.calculatePointsForPlayerStats = function calculatePointsForPlayerStats(playerStats) {
    return (playerStats.passingYards * this.pointsPerPassingYard) +
        (playerStats.passingTDs * this.pointsPerPassingTD) +
        (playerStats.rushingYards * this.pointsPerRushingYard) +
        (playerStats.rushingTDs * this.pointsPerRushingTD) +
        (playerStats.fumblesLost * this.pointsPerFumbleLost) +
        (playerStats.interceptionsLost * this.pointsPerInterceptionLost);
};

module.exports = new FantasyPointService();