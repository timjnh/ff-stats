'use strict';

var _ = require('underscore'),
    q = require('q'),
    assert = require('assert'),
    PlayerNetworkModel = require('./model/PlayerNetworkModel'),
    PlayerNetwork = require('../../domain/PlayerNetwork');

function PlayerNetworkRepository() {}

PlayerNetworkRepository.prototype.findByPlayerAndGameAndInputList = function findByPlayerAndGameAndInputList(player, game, inputsList) {
    var criteria,
        inputsListKey;

    inputsList.sort();
    inputsListKey = inputsList.join();

    criteria = {
        player: {
            name: player.name,
            team: player.team
        },
        game: {
            eid: game.eid
        },
        inputsListKey: inputsListKey
    };

    return this._findOneWithCriteria(criteria);
};

PlayerNetworkRepository.prototype._findOneWithCriteria = function _findOneWithCriteria(criteria) {
    return this._findWithCriteria(criteria)
        .then(function reduceToOne(playerNetworks) {
            assert(playerNetworks.length <= 1, 'Found multiple PlayerNetwork with criteria "' + JSON.stringify(criteria) + '"');
            return playerNetworks[0];
        });
};

PlayerNetworkRepository.prototype._findWithCriteria = function _findWithCriteria(criteria) {
    return q.Promise(function(resolve, reject) {
        PlayerNetworkModel.find(criteria, function(err, playerNetworks) {
            if(err) {
                reject(err);
            } else {
                resolve(playerNetworks.map(function createPlayerNetwork(playerNetworkModel) {
                    return PlayerNetwork.create(playerNetworkModel.toObject());
                }));
            }
        });
    });
};

PlayerNetworkRepository.prototype.save = function save(playerNetwork) {
    return q.Promise(function(resolve, reject) {
        if(!playerNetwork._id) {
            var model = new PlayerNetworkModel(playerNetwork);

            model.save(function(err) {
                return err ? reject(err) : resolve();
            });
        } else {
            PlayerNetworkModel.update({ _id: playerNetwork._id }, playerNetwork, function(err) {
                return err ? reject(err) : resolve();
            });
        }
    });
};

module.exports = new PlayerNetworkRepository();