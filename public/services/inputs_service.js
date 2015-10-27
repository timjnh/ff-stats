(function() {
    'use strict';

    angular.module('myApp.inputsService', [])
        .factory('inputsService', function($http) {
            var inputsService = {};

            inputsService.getAll = function getAll() {
                return $http.get('/inputs').then(function (response) {
                    var mappedByName = {};
                    response.data.forEach(function mapByName(input) {
                        mappedByName[input.name] = input;
                    });
                    return mappedByName;
                });
            };

            return inputsService;
        })
})();