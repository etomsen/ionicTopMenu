(function(){
    'use strict';
    angular
        .module('me.tomsen.ionicTopMenu')
        .directive('ionTopMenus', directiveFn);

    directiveFn.$inject = ['$ionicBody'];
    function directiveFn($ionicBody) {
        return {
            restrict: 'ECA',
            controller: '$ionicTopMenus',
            compile: function(element, attr) {
                attr.$set('class', (attr['class'] || '') + ' view');

                return { pre: prelink };
                function prelink($scope, $element, $attrs, ctrl) {

                    ctrl.enableMenuWithBackViews($scope.$eval($attrs.enableMenuWithBackViews));

                    $scope.$on('$ionicExposeAbove', function(evt, isAboveExposed) {
                        if (!$scope.$exposeAbove) {
                            $scope.$exposeAbove = {};
                        }
                        $scope.$exposeAbove.active = isAboveExposed;
                        $ionicBody.enableClass(isAboveExposed, 'above-open');
                    });

                    $scope.$on('$ionicExposeAside', function(evt, isAsideExposed) {
                        if (!$scope.$exposeAbove) {
                            $scope.$exposeAbove = {};
                        }
                        $scope.$exposeAbove.active = isAsideExposed;
                        $ionicBody.enableClass(isAsideExposed, 'above-open');
                    });

                    $scope.$on('$ionicView.beforeEnter', function(ev, d) {
                        if (d.historyId) {
                            $scope.$activeHistoryId = d.historyId;
                        }
                    });

                    $scope.$on('$destroy', function() {
                        $ionicBody.removeClass('topmenu-open', 'above-open');
                    });

                }
            }
        };
    }

}());