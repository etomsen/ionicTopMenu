(function(ionic){
    'use strict';
    angular
        .module('me.tomsen.ionicTopMenu')
        .directive('ionTopMenu', function(){
        return {
            restrict: 'E',
            require: '^ionTopMenus',
            scope: true,
            compile: function(element, attr) {
                angular.isUndefined(attr.isEnabled) && attr.$set('isEnabled', 'true');
                angular.isUndefined(attr.height) && attr.$set('height', '275');

                element.addClass('topmenu topmenu-' + attr.side);

                return function($scope, $element, $attr, topMenuCtrl) {
                    $scope.side = $attr.side || 'top';

                    var topMenu = topMenuCtrl[$scope.side] = new ionic.views.TopMenu({
                        height: attr.height,
                        el: $element[0],
                        isEnabled: true
                    });

                    $scope.$watch($attr.height, function(val) {
                        var numberVal = +val;
                        if (numberVal && numberVal === val) {
                            topMenu.setHeight(+val);
                        }
                    });
                    $scope.$watch($attr.isEnabled, function(val) {
                        topMenu.setIsEnabled(!!val);
                    });
                };
            }
        };
    });
}(ionic));