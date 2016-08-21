'use strict';

var teamsResource = require('./teams_resource.js'),
    Boom = require('Boom');

module.exports = [
    {
        method: 'GET',
        path: '/teams',
        handler: function (request, reply) {
            teamsResource.getAll()
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