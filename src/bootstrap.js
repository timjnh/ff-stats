'use strict';

var q = require('q'),
    mongoose = require('mongoose');

function Bootstrap() {}

Bootstrap.prototype.start = function start() {
    var deferred = q.defer();

    mongoose.connect('mongodb://localhost/stats');

    mongoose.connection.on('error', function(err) {
        console.error(err);
        process.exit();
    });

    mongoose.connection.once('open', deferred.resolve);

    return deferred.promise;
};

Bootstrap.prototype.stop = function stop() {
    return q.Promise(function(resolve, reject) {
        mongoose.disconnect(resolve);
    });
};

module.exports = new Bootstrap();
