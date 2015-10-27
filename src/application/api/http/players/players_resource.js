'use strict';

var q = require('q'),
    playerRepository = require('../../../../port/player/player_repository'),
    PlayerModel = require('./player_model');

function PlayersResource() {}

PlayersResource.prototype.getAll = function getAll() {
    return playerRepository.findAll()
        .then(function convertToPlayerModels(players) {
            return players.map(PlayerModel.create);
        });
};

module.exports = new PlayersResource();