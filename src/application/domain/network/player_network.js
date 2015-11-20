'use strict';

var _ = require('underscore'),
    Joi = require('joi'),
    networkStrategyFactory = require('./strategies/network_strategy_factory');

function PlayerNetwork(attributes) {
    var validatedAttributes = Joi.validate(attributes, PlayerNetwork.schema, { stripUnknown: true });
    if(validatedAttributes.error) {
        throw validatedAttributes.error;
    }

    _.extendOwn(this, validatedAttributes.value);

    Object.freeze(this);
    Object.freeze(this.player);
    Object.freeze(this.game);
    Object.freeze(this.inputsList);
    Object.freeze(this.network);
}

PlayerNetwork.schema = {
    _id: Joi.object(),
    player: Joi.object({
        name: Joi.string().min(1).required(),
        team: Joi.string().min(1).required()
    }).required(),
    game: Joi.object({
        eid: Joi.string().min(1).required()
    }).required(),
    inputsList: Joi.array().items(Joi.string().min(1)).min(1).required(),
    strategy: Joi.string().allow(networkStrategyFactory.getStrategyNames()).required(),
    network: Joi.object().required()
};

PlayerNetwork.create = function create(attributes) {
    return new PlayerNetwork(attributes);
};

module.exports = PlayerNetwork;