(function() {
    'use strict';

    angular.module('myApp.projectionsChart', ['chart.js', 'myApp.projectionsService'])
        .directive('projectionsChart', [function() {
            return {
                restrict: 'A',
                templateUrl: 'components/projections_chart/projections_chart.html',
                controllerAs: 'projectionsChartController',
                controller: 'ProjectionsChartController'
            };
        }])
        .controller('ProjectionsChartController', function($scope, ProjectionsService) {
            $scope.series = ['Projected', 'Actual'];
            $scope.labels = [];
            $scope.data = [[], []];

            ProjectionsService.getProjectionsForAllGames('T Brady', 'patriots')
                .then(function assembleChartData(projections) {
                    projections.forEach(function addProjectionToChartData(projection) {
                        if(projection.projected !== undefined) {
                            $scope.labels.push('Week ' + projection.game.week + ', ' + projection.game.year);
                            $scope.data[0].push(Math.round(projection.projected * 10) / 10);
                            $scope.data[1].push(projection.actual);
                        }
                    });
                });
        });
})();
