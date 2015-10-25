'use strict';

var Hapi = require('hapi'),
    Boom = require('boom'),
    projectionsRoutes = require('./src/application/api/http/projections/projections_routes');

var server = new Hapi.Server({ debug: { request: ['error'] } });
server.connection({ port: 8000 });

server.register(require('inert'), function (err) {
    if (err) {
        throw err;
    }

    projectionsRoutes.forEach(function addRouteToServer(route) {
        server.route(route);
    })

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