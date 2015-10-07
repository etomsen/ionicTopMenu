(function(){
    'use strict';
    angular
    .module('me.tomsen.ionicTopMenu')
    .directive('topMenuClose', ['$ionicHistory', function($ionicHistory) {
        return {
            restrict: 'AC',
            link: function($scope, $element) {
                $element.bind('click', function() {
                    var topMenuCtrl = $element.inheritedData('$ionTopMenusController');
                    if (topMenuCtrl) {
                        $ionicHistory.nextViewOptions({
                          historyRoot: true,
                          disableAnimate: true,
                          expire: 300
                      });
                        topMenuCtrl.close();
                    }
                });
            }
        };
    }]);
}());