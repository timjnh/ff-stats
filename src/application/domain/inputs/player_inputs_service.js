'use strict';

var inputsService = require('./inputs_service');

function PlayerInputsService() {}

PlayerInputsService.prototype.updateInputsForPlayerAndGame = function updateInputsForPlayerAndGame(player, playerGame) {
    var _this = this;
    return inputsService.getInputsForPlayerAndGame(player, playerGame)
        .then(function addGameToPlayer(inputs) {
            return _this.addGame(playerGame.update({ inputs: inputs }));
        });
};

module.exports = new PlayerInputsService();
