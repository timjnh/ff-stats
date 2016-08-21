'use strict';

var q = require('q'),
    playerRepository = require('../../../../port/player/player_repository'),
    PlayerModel = require('./player_model');

function PlayersResource() {}

PlayersResource.prototype.findByTeam = function findByTeam(team) {
    return playerRepository.findAllByTeam(team)
        .then(function convertToPlayerModels(players) {
            return players.map(PlayerModel.create);
        });
};

module.exports = new PlayersResource();