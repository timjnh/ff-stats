'use strict';

var fs = require('fs'),
    q = require('q'),
    assert = require('assert'),
    superagent = require('superagent'),
    sprintf = require('sprintf-js').sprintf,
    jsonPath = require('JSONPath'),
    Stats = require('../../domain/Stats');

function StatsRepository() {
    this.baseUrl = 'http://nfl.com/liveupdate/game-center/%(eid)s/%(eid)s_gtd.json';
}

StatsRepository.prototype.findByEid = function findByEid(eid) {
    var _this = this,
        url = sprintf(this.baseUrl, { eid: eid } );

    console.log(url);
    return new q.Promise(function retrieveStats(resolve, reject) {
            superagent
                .get(url)
                .end(function(err, result) {
                    if(err) {
                        reject(err);
                    } else {
                        var stats = result.body[eid];
                        assert(stats, 'Could not find stats for game with eid ' + eid);
                        resolve(stats);
                    }
                })
        })
        .then(function cleanStats(stats) {
            _this._removeDotsFromValues('$.home.stats..', 'name', stats);
            _this._removeDotsFromValues('$.away.stats..', 'name', stats);
            _this._removeDotsFromValues('$.drives..plays..players..[*].', 'playerName', stats);

            _this._removeDotsFromKeys('$.scrsummary..players', stats);

            return stats;
        })
        .then(function instantiateStats(stats) {
            return new Stats.create(stats);
        });
};

StatsRepository.prototype._removeDotsFromKeys = function _removeDotsFromKeys(path, stats) {
    var objectsWithKeys = jsonPath.eval(stats, path);
    objectsWithKeys.forEach(function removeDotsFromKeys(object) {
        for(var k in object) {
            var dotlessKey = k.replace(/\./g, ' ');
            if(dotlessKey != k) {
                object[dotlessKey] = object[k];
                delete object[k];
            }
        }
    });
};

StatsRepository.prototype._removeDotsFromValues = function _removeDotsFromValues(path, field, stats) {
    var objectsWithField = jsonPath.eval(stats, path + '[?(@.' + field + ')]');
    objectsWithField.forEach(function removeDotsFromField(object) {
        object[field] = object[field].replace(/\./g, ' ');
    });
};

module.exports = new StatsRepository();