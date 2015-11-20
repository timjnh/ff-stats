'use strict';

var _ = require('underscore'),
    bootstrap = require('./bootstrap'),
    Player = require('./application/domain/player/player'),
    PlayerGame = require('./application/domain/player/player_game'),
    playerNetworkService = require('./application/domain/network/player_network_service'),
    Worker = require('./lib/worker/worker');

function PlayerNetworkWorker() {
    Worker.call(this);
}
PlayerNetworkWorker.prototype = _.create(Worker.prototype, { constructor: PlayerNetworkWorker });

PlayerNetworkWorker.prototype.onMsgReceived = function onMsgReceived(payload) {
    var player = Player.create(payload.player),
        game = PlayerGame.create(payload.game),
        inputs = payload.inputs,
        strategy = payload.strategy;

    return playerNetworkService.buildNetworkUpToGame(player, game, inputs, strategy);
};

bootstrap.start()
    .then(function waitForWork() {
        var playerNetworkWorker = new PlayerNetworkWorker();
        return playerNetworkWorker.start();
    })
    .finally(bootstrap.stop.bind(bootstrap))
    .done();