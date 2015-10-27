(function() {
    'use strict';

    angular.module('myApp.projectionsService', [])
        .factory('projectionsService', function($http) {
            var projectionsService = {};

            projectionsService.getProjectionsForAllGamesWithInputs = function getProjectionsForAllGamesWithInputs(player, inputs) {
                return $http({
                        method: 'GET',
                        url: '/projections/' + player.name + '/' + player.team,
                        params: { "inputs[]": inputs }
                    }).then(function (response) {
                        return response.data;
                    });
            };

            return projectionsService;
        });
})();