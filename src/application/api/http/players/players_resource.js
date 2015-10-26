'use strict';

var q = require('q'),
    playerRepository = require('../../../../port/player/player_repository'),
    PlayerBO = require('./player_bo');

function PlayersResource() {}

PlayersResource.prototype.getAll = function getAll() {
    return playerRepository.findAll()
        .then(function convertToPlayerBOs(players) {
            return players.map(PlayerBO.create);
        });
};

module.exports = new PlayersResource();