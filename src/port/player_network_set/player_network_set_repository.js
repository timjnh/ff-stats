module.exports = (function() {
    'use strict';

    var _ = require('underscore'),
        q = require('q'),
        assert = require('assert'),
        PlayerNetworkSetModel = require('./model/player_network_set_model'),
        PlayerNetworkSet = require('../../application/domain/network/player_network_set');

    function PlayerNetworkSetRepository() {}

    PlayerNetworkSetRepository.prototype.findMatching = function findMatching(playerNetworkSet) {
        var criteria,
            inputsListKey,
            inputsList = _.clone(playerNetworkSet.inputsList);

        inputsList.sort();
        inputsListKey = inputsList.join();

        criteria = {
            player: {
                name: playerNetworkSet.player.name,
                team: playerNetworkSet.player.team
            },
            inputsListKey: inputsListKey,
            strategy: playerNetworkSet.strategy,
            startYear: playerNetworkSet.startYear,
            endYear: playerNetworkSet.endYear
        };

        return this._findOneWithCriteria(criteria);
    };

    PlayerNetworkSetRepository.prototype._findOneWithCriteria = function _findOneWithCriteria(criteria) {
        return this._findWithCriteria(criteria)
            .then(function reduceToOne(playerNetworkSets) {
                assert(playerNetworkSets.length <= 1, 'Found multiple playerNetworkSet with criteria "' + JSON.stringify(criteria) + '"');
                return playerNetworkSets[0];
            });
    };

    PlayerNetworkSetRepository.prototype._findWithCriteria = function _findWithCriteria(criteria) {
        return q.Promise(function(resolve, reject) {
            PlayerNetworkSetModel.find(criteria, function(err, playerNetworkSets) {
                if(err) {
                    reject(err);
                } else {
                    resolve(playerNetworkSets.map(function createPlayerNetworkSet(playerNetworkSetModel) {
                        return PlayerNetworkSet.create(playerNetworkSetModel.toObject());
                    }));
                }
            });
        });
    };

    PlayerNetworkSetRepository.prototype.save = function save(playerNetworkSet) {
        return q.Promise(function(resolve, reject) {
            if(!playerNetworkSet._id) {
                var model = new PlayerNetworkSetModel(playerNetworkSet);

                model.save(function(err) {
                    return err ? reject(err) : resolve();
                });
            } else {
                PlayerNetworkSetModel.update({ _id: playerNetworkSet._id }, playerNetworkSet, function(err) {
                    return err ? reject(err) : resolve();
                });
            }
        });
    };

    return new PlayerNetworkSetRepository();
})();