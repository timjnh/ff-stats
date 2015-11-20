(function() {
    'use strict';

    angular.module('myApp.projectionsService', [])
        .factory('projectionsService', function($http) {
            var projectionsService = {};

            projectionsService.getProjectionsForAllGames = function getProjectionsForAllGames(player, inputs) {
                return $http({
                        method: 'GET',
                        url: '/projections/' + player.name + '/' + player.team,
                        params: { "inputs[]": inputs, startYear: 2012, endYear: 2015 },
                        timeout: 5 * 60 * 1000 // 5 minutes
                    }).then(function (response) {
                        return response.data;
                    });
            };

            return projectionsService;
        });
})();