 'use strict';

var _ = require('underscore'),
    MessageHandler = require('../../../lib/worker/message_handler'),
    PlayerNetwork = require('./player_network'),
    Player = require('../player/player'),
    PlayerGame = require('../player/player_game'),
    playerNetworkService = require('./player_network_service');

function PlayerNetworkServiceMessageHandler() {
    MessageHandler.call(this, 'PlayerNetworkService.buildNetworkUpToGame');
}
PlayerNetworkServiceMessageHandler.prototype = _.create(MessageHandler.prototype, { constructor: PlayerNetworkServiceMessageHandler });

PlayerNetworkServiceMessageHandler.prototype.onMsgReceived = function onMsgReceived(payload) {
    var player = Player.create(payload.player),
        game = PlayerGame.create(payload.game),
        inputs = payload.inputs,
        strategy = payload.strategy;

    return playerNetworkService.buildNetworkUpToGame(player, game, inputs, strategy);
};

PlayerNetworkServiceMessageHandler.prototype.onResponseReceived = function onResponseReceived(payload) {
    var playerNetwork = payload;
    if(playerNetwork) {
        playerNetwork = PlayerNetwork.create(playerNetwork);
    }
    return playerNetwork;
};

module.exports = new PlayerNetworkServiceMessageHandler();