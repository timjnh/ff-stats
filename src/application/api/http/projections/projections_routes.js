'use strict';

var projectionsResource = require('./projections_resource.js'),
    Boom = require('Boom');

module.exports = [
    {
        method: 'GET',
        path: '/projections/{name}/{team}',
        config: {
            timeout: { socket: false }
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