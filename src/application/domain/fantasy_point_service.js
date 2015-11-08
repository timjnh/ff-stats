'use strict';

var assert = require('assert');

function FantasyPointService() {

    // offense
    this.pointsPerPassingYard = 0.04;
    this.pointsPerPassingTD = 4;

    this.pointsPerRushingYard = 0.1;
    this.pointsPerRushingTD = 6;

    this.pointsPerReceivingYard = 0.1;
    this.pointsPerReceivingTouchdown = 6;

    this.pointsPerConversion = 2;

    this.pointsPerFumbleLost = -2;
    this.pointsPerInterceptionLost = -2;

    // defense
    this.pointsPerSack = 1;
    this.pointsPerInterception = 2;
    this.pointsPerFumbleRecovery = 2;
    this.pointsPerTDFromTurnover = 6;
    this.pointsPerExtraPointsBlocked = 2;

    this.pointsIf0PointsAllowed = 5;
    this.pointsIfLessThan7PointsAllowed = 4;
    this.pointsIfLessThan14PointsAllowed = 3;
    this.pointsIfLessThan18PointsAllowed = 1;
    this.pointsIfLessThan28PointsAllowed = 0;
    this.pointsIfLessThan35PointsAllowed = -1;
    this.pointsIfLessThan46PointsAllowed = -3;
    this.pointsIf46OrMorePointsAllowed = -5;

    // kicking
    this.pointsPerFieldGoalMissed = -1;
    this.pointsPerFieldGoalMade50Plus = 5;
    this.pointsPerFieldGoalMade40Plus = 4;
    this.pointsPerFieldGoalMade0Plus = 3;
    this.pointsPerExtraPointMade = 1;
};

FantasyPointService.prototype.calculatePointsForPlayerStats = function calculatePointsForPlayerStats(playerStats) {

    return (0) + // make the rest of the highlighting look ok

        // offsense
        (playerStats.passingYards * this.pointsPerPassingYard) +
        (playerStats.passingTDs * this.pointsPerPassingTD) +

        (playerStats.rushingYards * this.pointsPerRushingYard) +
        (playerStats.rushingTDs * this.pointsPerRushingTD) +

        (playerStats.receivingYards * this.pointsPerReceivingYard) +
        (playerStats.receivingTDs * this.pointsPerReceivingTouchdown) +

        (playerStats.conversions * this.pointsPerConversion) +

        (playerStats.fumblesLost * this.pointsPerFumbleLost) +
        (playerStats.interceptionsLost * this.pointsPerInterceptionLost) +

        // defense
        (playerStats.sacks * this.pointsPerSack) +
        (playerStats.interceptions * this.pointsPerInterception) +
        (playerStats.fumbleRecoveries * this.pointsPerFumbleRecovery) +
        (playerStats.tdsFromTurnovers * this.pointsPerTDFromTurnover) +
        (playerStats.extraPointsBlocked * this.pointsPerExtraPointsBlocked) +

        (playerStats.pointsAllowed0 * this.pointsIf0PointsAllowed) +
        (playerStats.pointsAllowedLessThan7 * this.pointsIfLessThan7PointsAllowed) +
        (playerStats.pointsAllowedLessThan14 * this.pointsIfLessThan14PointsAllowed) +
        (playerStats.pointsAllowedLessThan18 * this.pointsIfLessThan18PointsAllowed) +
        (playerStats.pointsAllowedLessThan28 * this.pointsIfLessThan28PointsAllowed) +
        (playerStats.pointsAllowedLessThan35 * this.pointsIfLessThan35PointsAllowed) +
        (playerStats.pointsAllowedLessThan46 * this.pointsIfLessThan46PointsAllowed) +
        (playerStats.pointsAllowed46OrMore * this.pointsIf46OrMorePointsAllowed) +

        // kicking
        (playerStats.fieldGoalsMissed *this.pointsPerFieldGoalMissed) +
        (playerStats.fieldGoalsMade50Plus * this.pointsPerFieldGoalMade50Plus) +
        (playerStats.fieldGoalsMade40Plus * this.pointsPerFieldGoalMade40Plus) +
        (playerStats.fieldGoalsMade0Plus * this.pointsPerFieldGoalMade0Plus) +
        (playerStats.extraPointsMade * this.pointsPerExtraPointMade);
};

module.exports = new FantasyPointService();