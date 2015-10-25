(function() {
    'use strict';

    angular.module('myApp.projectionsChart', ['chart.js'])
        .directive('projectionsChart', [function() {
            return {
                restrict: 'A',
                templateUrl: 'components/projections_chart/projections_chart.html',
                controllerAs: 'projectionsChartController',
                controller: 'ProjectionsChartController'
            };
        }])
        .controller('ProjectionsChartController', ['$scope', function($scope) {
            $scope.labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
            $scope.series = ['Series A', 'Series B'];
            $scope.data = [
                [65, 59, 80, 81, 56, 55, 40],
                [28, 48, 40, 19, 86, 27, 90]
            ];
        }]);
})();
