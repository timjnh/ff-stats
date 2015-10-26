(function() {
    'use strict';

    angular.module('myApp.playersService', [])
        .factory('playersService', function($http) {
            var playersService = {};

            playersService.getAll = function getAll() {
                return $http.get('/players').then(function (response) {
                    return response.data;
                });
            };

            return playersService;
        })
})();