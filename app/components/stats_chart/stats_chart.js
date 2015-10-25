(function() {
    'use strict';

    angular.module('myApp.statsChart', ['chart.js'])
        .directive('statsChart', [function() {
            return {
                restrict: 'A',
                templateUrl: 'components/stats_chart/stats_chart.html',
                controllerAs: 'statsChartController',
                controller: 'StatsChartController'
            };
        }])
        .controller('StatsChartController', ['$scope', function($scope) {
            $scope.labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
            $scope.series = ['Series A', 'Series B'];
            $scope.data = [
                [65, 59, 80, 81, 56, 55, 40],
                [28, 48, 40, 19, 86, 27, 90]
            ];
        }]);
})();
