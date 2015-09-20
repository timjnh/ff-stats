'use strict';

var assert = require('assert');

function PlayerStats(attributes) {
    this.passingYards = 0;
    this.passingTDs = 0;

    this.conversions = 0;

    this.rushingYards = 0;
    this.rushingTDs = 0;

    this.receivingYards = 0;
    this.receivingTDs = 0;

    this.fumblesLost = 0;
    this.interceptionsLost = 0;

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
        this.interceptionsLost == 0) {
        return true;
    }
    return false;
};

module.exports = PlayerStats;