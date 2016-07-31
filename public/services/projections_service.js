(function() {
    'use strict';

    angular.module('myApp.projectionsService', [])
        .factory('projectionsService', function($http) {
            var projectionsService = {};

            projectionsService.getProjectionsForAllGames = function getProjectionsForAllGames(player, inputs, networkStrategy) {
                return $http({
                        method: 'GET',
                        url: '/projections/' + player.name + '/' + player.team,
                        params: { "inputs[]": inputs, startYear: 2012, networkStrategy: networkStrategy },
                        timeout: 5 * 60 * 1000 // 5 minutes
                    }).then(function (response) {
                        return response.data;
                    });
            };

            return projectionsService;
        });
})();