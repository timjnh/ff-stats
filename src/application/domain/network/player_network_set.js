'use strict';

var _ = require('underscore'),
    Joi = require('joi'),
    networkStrategyFactory = require('./strategies/network_strategy_factory');

function PlayerNetworkSet(attributes) {
    var validatedAttributes = Joi.validate(attributes, PlayerNetworkSet.schema, { stripUnknown: true });
    if(validatedAttributes.error) {
        throw validatedAttributes.error;
    }

    _.extendOwn(this, validatedAttributes.value);

    Object.freeze(this);
    Object.freeze(this.player);
    Object.freeze(this.inputsList);
}

PlayerNetworkSet.schema = {
    _id: Joi.object(),
    player: Joi.object({
        name: Joi.string().min(1).required(),
        team: Joi.string().min(1).required()
    }).required(),
    inputsList: Joi.array().items(Joi.string().min(1)).min(1).required(),
    strategy: Joi.string().allow(networkStrategyFactory.getStrategyNames()).required(),
    startYear: Joi.number().min(2009).max((new Date().getYear()) + 1900).required(),
    endYear: Joi.number().min(2009).max((new Date().getYear()) + 1900).required(),
    standardDeviation: Joi.number().required()
};

PlayerNetworkSet.create = function create(attributes) {
    return new PlayerNetworkSet(attributes);
};

PlayerNetworkSet.prototype.setId = function setId(id) {
    return PlayerNetworkSet.create(_.extend(_.clone(this), { _id: id }));
};

module.exports = PlayerNetworkSet;