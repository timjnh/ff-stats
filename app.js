'use strict';

var _ = require('underscore'),
    Hapi = require('hapi'),
    bootstrap = require('./src/bootstrap'),
    workerService = require('./src/lib/worker/worker_service'),
    routes = [
        require('./src/application/api/http/projections/projections_routes'),
        require('./src/application/api/http/players/players_routes'),
        require('./src/application/api/http/teams/teams_routes'),
        require('./src/application/api/http/inputs/inputs_routes')
    ];

var server = new Hapi.Server({ debug: { request: ['error'] } });
server.connection({ port: 8000 });

server.register(require('inert'), function (err) {
    if (err) {
        throw err;
    }

    _.flatten(routes).forEach(function addRouteToServer(route) {
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
        bootstrap.start()
            .then(function startWorkerService() {
                return workerService.start();
            }).then(function inform() {
                console.log('Server running at:', server.info.uri);
            });
    });
});

process.once('SIGUSR2', function() {
    workerService.stop()
        .then(bootstrap.stop.bind(bootstrap))
        .then(function stopServerAndKill() {
            server.stop(function killProcess() {
                console.log('Server stopped');
                process.kill(process.pid, 'SIGUSR2');
            });
        });
});