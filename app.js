'use strict';

var _ = require('underscore'),
    Hapi = require('hapi'),
    bootstrap = require('./src/bootstrap'),
    projectionsRoutes = require('./src/application/api/http/projections/projections_routes'),
    playersRoutes = require('./src/application/api/http/players/players_routes');

var server = new Hapi.Server({ debug: { request: ['error'] } });
server.connection({ port: 8000 });

server.register(require('inert'), function (err) {
    if (err) {
        throw err;
    }

    _.flatten([projectionsRoutes, playersRoutes]).forEach(function addRouteToServer(route) {
        server.route(route);
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
        bootstrap.start().then(function inform() {
            console.log('Server running at:', server.info.uri);
        });
    });
});

process.once('SIGUSR2', function() {
    bootstrap.stop().then(function stopServerAndKill() {
        server.stop(function killProcess() {
            console.log('Server stopped');
            process.kill(process.pid, 'SIGUSR2');
        });
    });
});