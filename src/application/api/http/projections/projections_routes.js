'use strict';

var projectionsResource = require('./projections_resource.js');

module.exports = [
    {
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
    }
];