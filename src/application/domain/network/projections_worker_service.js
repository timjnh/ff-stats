'use strict';

var _ = require('underscore'),
    workerService = require('../../../lib/worker/worker_service'),
    projectionsServiceMessageHandler = require('./projections_service_message_handler');

function ProjectionsWorkerServiceService() {
    workerService.registerMsgHandler(projectionsServiceMessageHandler);
}

ProjectionsWorkerServiceService.prototype.buildProjectionsFromSingleNetwork = function buildProjectionsFromSingleNetwork(playerNetwork, player, inputsList, startDate, endDate) {
    var payload = {
        playerNetwork: playerNetwork,
        player: player,
        inputsList: inputsList,
        startDate: startDate,
        endDate: endDate
    };
    return workerService.queueJob(projectionsServiceMessageHandler.command, payload);
};

module.exports = new ProjectionsWorkerServiceService();