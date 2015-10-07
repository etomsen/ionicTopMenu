(function(){
    'use strict';
    angular
    .module('me.tomsen.ionicTopMenu')
    .directive('topMenuToggle', function() {
        return {
            restrict: 'AC',
            link: function($scope, $element, $attr) {
                $scope.$on('$ionicView.beforeEnter', function(ev, viewData) {
                    if (viewData.enableBack) {
                        var topMenuCtrl = $element.inheritedData('$ionTopMenusController');
                        if (!topMenuCtrl.enableMenuWithBackViews()) {
                            $element.addClass('hide');
                        }
                    } else {
                        $element.removeClass('hide');
                    }
                });

                $element.bind('click', function() {
                    var topMenuCtrl = $element.inheritedData('$ionTopMenusController');
                    topMenuCtrl && topMenuCtrl.toggle($attr.topMenuToggle);
                });
            }
        };
    });
}());