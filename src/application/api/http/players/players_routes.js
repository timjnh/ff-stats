'use strict';

var Joi = require('joi'),
    playersResource = require('./players_resource.js'),
    Boom = require('Boom'),
    Team = require('../../../domain/team/team');

module.exports = [
    {
        method: 'GET',
        path: '/teams/{team}/players',
        config: {
            validate: {
                params: {
                    team: Joi.string().valid(Team.TEAMS).required()
                }
            }
        },
        handler: function (request, reply) {
            playersResource.findByTeam(request.params.team)
                .then(function afterRead(response) {
                    reply(response);
                })
                .catch(function readFailed(err) {
                    reply(Boom.badImplementation(err));
                })
                .done();
        }
    }
];