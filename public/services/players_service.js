(function() {
    'use strict';

    angular.module('myApp.playersService', [])
        .factory('playersService', function($http) {
            var playersService = {};

            playersService.findByTeam = function findByTeam(team) {
                return $http.get('/teams/' + team + '/players').then(function (response) {
                    return response.data;
                });
            };

            return playersService;
        })
})();