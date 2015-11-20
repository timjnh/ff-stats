'use strict';

var _ = require('underscore'),
    Joi = require('joi'),
    PlayerPosition = require('../../../domain/player/player_position');

function PlayerModel(attributes) {
    var validatedAttributes = Joi.validate(attributes, PlayerModel.schema, { stripUnknown: true });
    if(validatedAttributes.error) {
        throw validatedAttributes.error;
    }

    _.extendOwn(this, validatedAttributes.value);
    Object.freeze(this);
};

PlayerModel.schema = {
    name: Joi.string().min(1).required(),
    team: Joi.string().min(1).required(),
    position: Joi.string().valid(_.values(PlayerPosition))
};

PlayerModel.create = function create(attributes) {
    return new PlayerModel(attributes);
};

module.exports = PlayerModel;