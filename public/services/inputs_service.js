(function() {
    'use strict';

    angular.module('myApp.inputsService', [])
        .factory('inputsService', function($http) {
            var inputsService = {};

            inputsService.getInputsForPosition = function getInputsForPosition(position) {
                return $http.get('/inputs/' + position).then(function (response) {
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