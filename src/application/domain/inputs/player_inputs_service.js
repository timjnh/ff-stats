'use strict';

var inputsService = require('./inputs_service');

function PlayerInputsService() {}

PlayerInputsService.prototype.updateInputsForPlayerAndGame = function updateInputsForPlayerAndGame(player, playerGame) {
    return inputsService.getInputsForPlayerAndGame(player, playerGame)
        .then(function addGameToPlayer(inputs) {
            return player.addGame(playerGame.update({ inputs: inputs }));
        });
};

module.exports = new PlayerInputsService();
