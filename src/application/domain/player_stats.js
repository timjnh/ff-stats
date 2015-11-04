'use strict';

var assert = require('assert');

function PlayerStats(attributes) {

    // offense
    this.passingYards = 0;
    this.passingTDs = 0;

    this.conversions = 0;

    this.rushingYards = 0;
    this.rushingTDs = 0;

    this.receivingYards = 0;
    this.receivingTDs = 0;

    this.fumblesLost = 0;
    this.interceptionsLost = 0;

    // defense
    this.sacks = 0;
    this.interceptions = 0;
    this.fumbleRecoveries = 0;

    this.rushingYardsAllowed = 0;
    this.rushingTDsAllowed = 0;

    this.passingYardsAllowed = 0;
    this.passingTDsAllowed = 0;

    // kicking
    this.fieldGoalsMissed = 0;
    this.fieldGoalsMade50Plus = 0;
    this.fieldGoalsMade40Plus = 0;
    this.fieldGoalsMade0Plus = 0;
    this.extraPointsMade = 0;
    this.extraPointsMissed = 0;

    if(attributes) {
        this.add(attributes);
    }
}

PlayerStats.create = function create(attributes) {
    return new PlayerStats(attributes);
};

PlayerStats.prototype.add = function add(playerStats) {
    for(var k in playerStats) {
        if(typeof playerStats[k] == 'number') {
            assert(this.hasOwnProperty(k), 'Unknown stat type "' + k + '"');
            this[k] += playerStats[k];
        }
    }
};

PlayerStats.prototype.isEmpty = function isEmpty() {
    if(this.passingYards == 0 &&
        this.passingTDs == 0 &&
        this.conversions == 0 &&
        this.rushingYards == 0 &&
        this.rushingTDs == 0 &&
        this.receivingYards == 0 &&
        this.receivingTDs == 0 &&
        this.fumblesLost == 0 &&
        this.interceptionsLost == 0 &&
        this.sacks == 0 &&
        this.interceptions == 0 &&
        this.fumbleRecoveries == 0 &&
        this.rushingYardsAllowed == 0 &&
        this.rushingTDsAllowed == 0 &&
        this.passingYardsAllowed == 0 &&
        this.passingTDsAllowed == 0) {
        return true;
    }
    return false;
};

module.exports = PlayerStats;