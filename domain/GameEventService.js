'use strict';

var assert = require('assert'),
    PlayerStats = require('./PlayerStats');

function GameEventService() {}

GameEventService.prototype.buildPlayerStatsFromEvent = function buildPlayerStatsFromEvent(event) {
    switch(event.statId) {
        case 10: // rushing yards
            return PlayerStats.create({ rushingYards: event.yards });
        case 11: // rushing td
            return PlayerStats.create({ rushingTDs: 1 });
        case 15: // passing yards including distance covered by receiver (see also 111)
            return PlayerStats.create({ passingYards: event.yards });
        case 16: // passing yards with td
            return PlayerStats.create({ passingYards: event.yards, passingTDs: 1 });
        case 19: // pass attempt resulted in interception
            return PlayerStats.create({ interceptionsLost: 1 });
        case 20: // yards lost due to sack
            assert(event.yards <= 0, 'Expected yardage to be negative for a sack!');
            return PlayerStats.create({ passingYards: event.yards });
        case 21: // pass reception yards
            return PlayerStats.create({ receivingYards: event.yards });
        case 55: // yardage after fumble recovery
            return PlayerStats.create({ rushingYards: event.yards }); // treating this the same as rushing yards?
        case 77: // 2 point conversion good
            return PlayerStats.create({ conversions: 1 });
        case 106: // lost fumble
            return PlayerStats.create({ fumblesLost: 1 });
        case 14: // pass, no completion
        case 52: // forced fumble. zero because we only lose points if it's not recovered (see 106)
        case 53: // unforced fumble. zero because we only lose points if it's not recovered (see 106)
        case 54: // fumble out of bounds.  no points against i don't think
        case 57: // if a player recovered a fumble by his own team, then lateraled to a teammate, the yardage gained/lost by the teammate would be recorded with this stat.  not really sure what to do here
        case 78: // 2 point conversion failure
        case 79: // tackle with no assist
        case 93: // penalty
        case 111: // passing length minus receiver yardage (see 15)
        case 112: // passing length, no completion
        case 113: // yards after catch
        case 115: // player was the target of a pass attempt
            return PlayerStats.create();
        default:
            throw 'Unknown statId "' + event.statId + '"';
    }
};

module.exports = new GameEventService();