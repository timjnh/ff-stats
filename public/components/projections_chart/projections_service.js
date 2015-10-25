(function() {
    'use strict';

    angular.module('myApp.projectionsService', [])
        .factory('ProjectionsService', function($http) {
            var projectionsService = {};

            projectionsService.getProjectionsForAllGames = function getProjectionsForAllGames(player, team) {
                return $http.get('/projections/' + player + '/' + team).then(function (response) {
                    return response.data;
                });
            };

            return projectionsService;
        });
})();