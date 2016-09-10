'use strict';

function MessageHandler(command) {
    this.command = command;
}

MessageHandler.prototype.onMsgReceived = function onMsgReceived(payload) {
    throw new Error('onMsgReceived has not been implemented for "' + this.constructor.name + '"');
};

MessageHandler.prototype.onResponseReceived = function onResponseReceived(payload) {
    throw new Error('onResponseReceived has not been implemented for "' + this.constructor.name + '"');
};

module.exports = MessageHandler;