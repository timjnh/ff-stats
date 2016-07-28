'use strict';

var assert = require('assert'),
    validAttributes = [
        // offense
        'passingYards',
        'passingTDs',

        'conversions',

        'rushingYards',
        'rushingTDs',
        'touches',

        'receivingYards',
        'receivingTDs',
        'targets',

        'fumblesLost',
        'interceptionsLost',

        // defense
        'sacks',
        'interceptions',
        'fumbleRecoveries',
        'tdsFromTurnovers',
        'extraPointsBlocked',

        'pointsAllowed0',
        'pointsAllowedLessThan7',
        'pointsAllowedLessThan14',
        'pointsAllowedLessThan18',
        'pointsAllowedLessThan28',
        'pointsAllowedLessThan35',
        'pointsAllowedLessThan46',
        'pointsAllowed46OrMore',

        'rushingYardsAllowed',
        'rushingTDsAllowed',

        'passingYardsAllowed',
        'passingTDsAllowed',

        // kicking
        'fieldGoalsMissed',
        'fieldGoalsMade50Plus',
        'fieldGoalsMade40Plus',
        'fieldGoalsMade0Plus',
        'extraPointsMade',
        'extraPointsMissed'
    ];

function PlayerStats(attributes) {
    var _this = this;

    validAttributes.forEach(function defaultAttributeToZero(attribute) {
        _this[attribute] = 0;
    });

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

PlayerStats.prototype.getValue = function getValue(statName) {
    if(!this.hasOwnProperty(statName)) {
        throw 'Attempted to retrieve unknown stat "' + statName + '"';
    }
    return this[statName];
};

PlayerStats.prototype.isEmpty = function isEmpty() {
    var _this = this;
    return validAttributes.reduce(function updateIsEmpty(isEmpty, attribute) {
        return isEmpty && _this[attribute] == 0;
    }, true);
};

module.exports = PlayerStats;