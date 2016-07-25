'use strict';

var _ = require('underscore'),
    Joi = require('joi');

function TeamPlayer(attributes) {
    var validatedAttributes = Joi.validate(attributes, TeamPlayer.schema, { stripUnknown: true });
    if(validatedAttributes.error) {
        throw validatedAttributes.error;
    }

    _.extendOwn(this, validatedAttributes.value);
    Object.freeze(this);
}

TeamPlayer.schema = {
    name: Joi.string().required(),
    position: Joi.string().required(),
    played: Joi.boolean().required(),
    injured: Joi.boolean().required()
};

TeamPlayer.create = function create(attributes) {
    return new TeamPlayer(attributes);
};

TeamPlayer.prototype.equals = function equals(otherPlayer) {
    return this.name === otherPlayer.name &&
            this.position === otherPlayer.position &&
            this.played === otherPlayer.played &&
            this.injured === otherPlayer.injured;
};

module.exports = TeamPlayer;