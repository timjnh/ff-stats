'use strict';

var assert = require('assert'),
    PlayerStats = require('./player_stats');

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
            return PlayerStats.create({ receivingYards: event.yards, targets: 1 });
        case 22: // pass reception yards with touchdown
            return PlayerStats.create({ receivingTDs: 1, receivingYards: event.yards, targets: 1 });
        case 26: // interception yards with a touchdown
            // TODO: verify this
            return PlayerStats.create({ tdsFromTurnovers: 1 });
        case 28: // interception, lateralled to a teammate who got a touchdown.  wtf?
            // TODO: verify this
            return PlayerStats.create({ tdsFromTurnovers: 1 });
        case 56: // yardage after fumble recovery with touchdown
            // TODO: verify this
            return PlayerStats.create({ tdsFromTurnovers: 1 });
        case 69: // missed field goal yards
            return PlayerStats.create({ fieldGoalsMissed: 1 });
        case 70: // made field goal yards
            if(event.yards >= 50) {
                return PlayerStats.create({ fieldGoalsMade50Plus: 1 });
            } else if(event.yards < 50 && event.yards >= 40) {
                return PlayerStats.create({ fieldGoalsMade40Plus: 1 });
            } else if(event.yards < 40) {
                return PlayerStats.create({ fieldGoalsMade0Plus: 1 });
            }
        case 72: // extra point made
            return PlayerStats.create({ extraPointsMade: 1 });
        case 73: // extra point missed
            return PlayerStats.create({ extraPointsMissed: 1 });
        case 74: // extra point blocked
            // TODO: verify this
            return PlayerStats.create({ extraPointsBlocked: 1});
        case 75: // 2 point conversion good rush
            return PlayerStats.create({ conversions: 1 });
        case 77: // 2 point conversion good pass
            return PlayerStats.create({ conversions: 1 });
        case 104: // 2 point conversion received passing
            return PlayerStats.create({ conversions: 1, receivingYards: event.yards, targets: 1 });
        case 106: // lost fumble
            return PlayerStats.create({ fumblesLost: 1 });
        case 115: // player was the target of a pass attempt`
            return PlayerStats.create({ targets: 1 });
        case 2: // blocked punt (offense)
        case 3: // first down resulting from rush
        case 4: // first down resulting from pass
        case 5: // first down resulting from penalty
        case 6: // 3rd down attempt converted
        case 7: // 3rd down attempt failed
        case 8: // 4th down attempt converted
        case 9: // 4th down attempt failed
        case 12: // rushing yards, no rush (lateral something something)
        case 14: // pass, no completion
        case 23: // pass reception yards resulting from lateral
        case 25: // interception yards
        case 27: // interception yards with a lateral
        case 29: // punt
        case 30: // punt inside 20
        case 31: // punt into endzone
        case 32: // punt with touchback
        case 33: // punt return yards
        case 34: // punt return yards with touchdown
        case 35: // punt return yards with lateral
        case 36: // punt reutrn yards with lateral resulting in a touchdown
        case 37: // punt out of bounds
        case 38: // punt downed by kicking team
        case 39: // punt with fair catch
        case 40: // punt with touchback (see 32)
        case 41: // kickoff yards
        case 42: // kickoff inside 20
        case 43: // kickoff into endzone
        case 44: // kickoff with touchback
        case 45: // kickoff return yards
        case 46: // kickoff return yards with touchdown
        case 47: // kickoff return yards with lateral
        case 48: // kickoff return yards with lateral resulting in touchdown
        case 49: // kickoff out of bounds
        case 50: // kickoff with fair catch
        case 51: // kickoff with touchback
        case 52: // forced fumble. zero because we only lose points if it's not recovered (see 106)
        case 53: // unforced fumble. zero because we only lose points if it's not recovered (see 106)
        case 54: // fumble out of bounds.  no points against i don't think
        case 55: // yardage after fumble recovery
        case 57: // if a player recovered a fumble by his own team, then lateraled to a teammate, the yardage gained/lost by the teammate would be recorded with this stat.  not really sure what to do here
        case 59: // opponent fumble recovery yards
        case 60: // opponent fumble recovery yards with touchdown // TODO: verify this
        case 61: // opponent fumble recovery yards with lateral
        case 62: // opponent fumble recovery yards with lateral and a touchdown // TODO: verify this
        case 63: // misc yardage (blocked punt)
        case 64: // misc yards resulting in touchdown.  not sure what to do with this // TODO: verify this
        case 68: // timeout
        case 71: // field goal blocked (offense, that seems bad)
        case 76: // 2 point conversion failure rush
        case 78: // 2 point conversion failure pass
        case 79: // tackle with no assist
        case 80: // assisted tackle
        case 81: // half tackle
        case 82: // tackle assit
        case 83: // sack yards (defense)
        case 84: // half sack yards (defense)
        case 85: // pass successfully defended
        case 86: // punt blocked (defense)
        case 87: // extra point blocked (defense)
        case 88: // field goal blocked (defense)
        case 89: // safety (defense)
        case 90: // half safety (defense)
        case 91: // forced fumble (defense)
        case 93: // penalty
        case 95: // tackled for a loss
        case 96: // extra point results in safety // TODO: verify this
        case 99: // 2 point rush safety // TODO: verify this
        case 100: // 2 point pass safety // TODO: verify this
        case 102: // kickoff kick downed
        case 103: // sack yards, no sack. fumble, recover, lateral
        case 105: // 2 point reception failed, passing
        case 107: // own kickoff recovered
        case 108: // own kickoff recovered for touchdown // TODO: verify this
        case 110: // quarterback hit
        case 111: // passing length minus receiver yardage (see 15)
        case 112: // passing length, no completion
        case 113: // yards after catch
        case 115: // player was the target of a pass attempt
        case 120: // tackled for a loss
        case 301: // extra point aborted
        case 402: // ?
        case 403: // ?
        case 410: // ?
            return PlayerStats.create();
        default:
            throw 'Unknown statId "' + event.statId + '"';
    }
};

module.exports = new GameEventService();