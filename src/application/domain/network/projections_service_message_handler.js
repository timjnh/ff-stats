'use strict';

var _ = require('underscore'),
    MessageHandler = require('../../../lib/worker/message_handler'),
    Player = require('../player/player'),
    PlayerNetwork = require('./player_network'),
    projectionsService = require('./projections_service'),
    Projection = require('./projection');

function ProjectionsServiceMessageHandler() {
    MessageHandler.call(this, 'ProjectionsService.buildProjectionsFromSingleNetwork');
}
ProjectionsServiceMessageHandler.prototype = _.create(MessageHandler.prototype, { constructor: ProjectionsServiceMessageHandler });

ProjectionsServiceMessageHandler.prototype.onMsgReceived = function onMsgReceived(payload) {
    var playerNetwork = PlayerNetwork.create(payload.playerNetwork),
        player = Player.create(payload.player);

    return projectionsService.buildProjectionsFromSingleNetwork(playerNetwork, player, payload.inputsList, payload.startDate, payload.endDate);
};

ProjectionsServiceMessageHandler.prototype.onResponseReceived = function onResponseReceived(payload) {
    return payload.map(function buildProjection(projection) {
        return Projection.create({
            projected: projection.projected,
            actual: projection.actual,
            game: projection.game,
            player: projection.player
        });
    });
};

module.exports = new ProjectionsServiceMessageHandler();