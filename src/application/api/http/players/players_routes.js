'use strict';

var playersResource = require('./players_resource.js'),
    Boom = require('Boom');

module.exports = [
    {
        method: 'GET',
        path: '/players',
        handler: function (request, reply) {
            playersResource.getAll()
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