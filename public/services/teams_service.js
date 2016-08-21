(function() {
    'use strict';

    angular.module('myApp.teamsService', [])
        .factory('teamsService', function($http) {
            var teamsService = {};

            teamsService.getAll = function getAll() {
                return $http.get('/teams').then(function (response) {
                    return response.data;
                });
            };

            return teamsService;
        })
})();