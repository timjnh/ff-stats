'use strict';

var projectionsResource = require('./projections_resource.js'),
    Boom = require('Boom'),
    Joi = require('joi'),
    seasonService = require('../../../domain/season_service'),
    inputsService = require('../../../domain/inputs/inputs_service'),
    Team = require('../../../domain/team/team'),
    networkStrategyFactory = require('../../../domain/network/strategies/network_strategy_factory');

module.exports = [
    {
        method: 'GET',
        path: '/projections/{name}/{team}',
        config: {
            timeout: { socket: false },
            validate: {
                params: {
                    name: Joi.string().required(),
                    team: Joi.string().valid(Team.TEAMS).required()
                },
                query: {
                    inputs: Joi.array().items(Joi.string().valid(inputsService.getInputsList())).required(),
                    networkStrategy: Joi.string().valid(networkStrategyFactory.getStrategyNames()).required(),
                    startYear: Joi.number().min(seasonService.getFirstSeason()).default(seasonService.getFirstSeason()),
                    endYear: Joi.number().max(seasonService.getCurrentSeason()).default(seasonService.getCurrentSeason())
                }
            }
        },
        handler: function (request, reply) {
            var player = { name: request.params.name, team: request.params.team };

            projectionsResource.get(player, request.query.inputs, request.query.networkStrategy, request.query.startYear, request.query.endYear)
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