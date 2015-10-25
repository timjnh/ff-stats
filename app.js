'use strict';

var Hapi = require('hapi'),
    Boom = require('boom'),
    projectionsResource = require('./src/application/api/http/projections/projections_resource');

var server = new Hapi.Server({ debug: { request: ['error'] } });
server.connection({ port: 8000 });

server.register(require('inert'), function (err) {
    if (err) {
        throw err;
    }

    server.route({
        method: 'GET',
        path: '/projections/{name}/{team}',
        handler: function (request, reply) {
            projectionsResource.get(request.params.name, request.params.team)
                .then(function afterRead(response) {
                    reply(response);
                })
                .catch(function readFailed(err) {
                    reply(Boom.badImplementation(err));
                })
                .done();
        }
    });

    server.route({
        method: 'GET',
        path: '/{param*}',
        handler: {
            directory: {
                path: 'public',
                index: ['index.html']
            }
        }
    });

    server.start(function () {
        console.log('Server running at:', server.info.uri);
    });
});