'use strict';

var inputsResource = require('./inputs_resource.js'),
    Boom = require('Boom');

module.exports = [
    {
        method: 'GET',
        path: '/inputs/{position}',
        handler: function (request, reply) {
            inputsResource.getListForPosition(request.params.position)
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