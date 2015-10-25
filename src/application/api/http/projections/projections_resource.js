'use strict';

var q = require('q');

function ProjectionsResource() {}

ProjectionsResource.prototype.get = function get(name, team) {
    return q.when({ name: name, team: team });
};

module.exports = new ProjectionsResource();