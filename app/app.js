'use strict';

var Hapi = require('hapi');

var server = new Hapi.Server({ debug: { request: ['error'] } });
server.connection({ port: 8000 });

server.register(require('inert'), function (err) {
    if (err) {
        throw err;
    }

    server.route({
        method: 'GET',
        path: '/{param*}',
        handler: {
            directory: {
                path: 'app/public',
                index: ['index.html']
            }
        }
    });

    server.start(function () {
        console.log('Server running at:', server.info.uri);
    });
});