'use strict';

var _ = require('underscore'),
    assert = require('assert'),
    Joi = require('joi'),
    TeamPlayer = require('./team_player');

function TeamGame(attributes) {
    var validatedAttributes = Joi.validate(attributes, TeamGame.schema, { stripUnknown: true });
    if(validatedAttributes.error) {
        throw validatedAttributes.error;
    }

    _.extendOwn(this, validatedAttributes.value);
    Object.freeze(this);
}

TeamGame.schema = {
    eid: Joi.string().required(),
    week: Joi.number().required(),
    year: Joi.number().required(),
    players: Joi.array().items(TeamPlayer.schema).required()
};

TeamGame.create = function create(attributes) {
    if(attributes.players && attributes.players.length > 0) {
        attributes.players = attributes.players.map(function createTeamPlayer(player) {
            return TeamPlayer.create(player);
        });
    }

    return new TeamGame(attributes);
};

TeamGame.prototype.addPlayer = function addPlayer(teamPlayer) {
    var players,
        existingPlayer = _.findWhere(this.players, { name: teamPlayer.name });

    if(existingPlayer) {
        assert(existingPlayer.equals(teamPlayer));
        return this;
    } else {
        players = _.clone(this.players);
        players.push(teamPlayer);

        return TeamGame.create(_.extend(_.clone(this), { players: players }));
    }
};

TeamGame.prototype.merge = function merge(otherGame) {
    var teamGame = this;

    assert(this.eid == otherGame.eid, 'eids must match when merging TeamGames');
    assert(this.week == otherGame.week, 'weeks must match when merging TeamGames');
    assert(this.year == otherGame.year, 'years must match when merging TeamGames');

    otherGame.players.forEach(function addPlayerToGame(player) {
        teamGame = teamGame.addPlayer(player);
    });

    return teamGame;
};

module.exports = TeamGame;