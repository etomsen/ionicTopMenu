(function(ionic){
    'use strict';
    angular
    .module('me.tomsen.ionicTopMenu')
    .directive('exposeAboveWhen', ['$window', function($window) {
        return {
            restrict: 'A',
            require: '^ionTopMenus',
            link: function($scope, $element, $attr, topMenuCtrl) {

                function checkAboveExpose() {
                    var mq = $attr.exposeAboveWhen === 'large' ? '(min-height:768px)' : $attr.exposeAboveWhen;
                    topMenuCtrl.exposeAbove($window.matchMedia(mq).matches);
                    topMenuCtrl.activeAboveResizing(false);
                }

                function onResize() {
                    topMenuCtrl.activeAboveResizing(true);
                    debouncedCheck();
                }

                var debouncedCheck = ionic.debounce(function() {
                    $scope.$apply(checkAboveExpose);
                }, 300, false);

                $scope.$evalAsync(checkAboveExpose);

                ionic.on('resize', onResize, $window);

                $scope.$on('$destroy', function() {
                    ionic.off('resize', onResize, $window);
                });

            }
        };
    }]);
}(ionic));