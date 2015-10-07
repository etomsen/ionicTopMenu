(function(ionic){
    'use strict';
    angular
        .module('me.tomsen.ionicTopMenu')
        .directive('ionTopMenuContent', directiveFn);

    directiveFn.$inject = ['$timeout','$ionicGesture','$window'];

    function directiveFn($timeout, $ionicGesture, $window) {
        return {
            restrict: 'EA', //DEPRECATED 'A'
            require: '^ionTopMenus',
            scope: true,
            compile: function(element, attr) {
                element.addClass('topmenu-content pane');
                return { pre: prelink };
                function prelink($scope, $element, $attr, topMenuCtrl) {
                    var startCoord = null;
                    var primaryScrollAxis = null;
                    if (angular.isDefined(attr.dragContent)) {
                        $scope.$watch(attr.dragContent, function(value) {
                            topMenuCtrl.canDragContent(value);
                        });
                    } else {
                        topMenuCtrl.canDragContent(true);
                    }

                    if (angular.isDefined(attr.edgeDragThreshold)) {
                        $scope.$watch(attr.edgeDragThreshold, function(value) {
                            topMenuCtrl.edgeDragThreshold(value);
                        });
                    }

                    // Listen for taps on the content to close the menu
                    function onContentTap(gestureEvt) {
                        if (topMenuCtrl.getOpenAmount() !== 0) {
                            topMenuCtrl.close();
                            gestureEvt.gesture.srcEvent.preventDefault();
                            startCoord = null;
                            primaryScrollAxis = null;
                        } else if (!startCoord) {
                            startCoord = ionic.tap.pointerCoord(gestureEvt.gesture.srcEvent);
                        }
                    }

                    function onDragY(e) {
                        if (!topMenuCtrl.isDraggableTarget(e)) {
                            return;
                        }
                        if (getPrimaryScrollAxis(e) === 'y') {
                            topMenuCtrl._handleDrag(e);
                            e.gesture.srcEvent.preventDefault();
                        }
                    }

                    function onDragX(e) {
                        if (getPrimaryScrollAxis(e) === 'y') {
                            e.gesture.srcEvent.preventDefault();
                        }
                    }

                    function onDragRelease(e) {
                        topMenuCtrl._endDrag(e);
                        startCoord = null;
                        primaryScrollAxis = null;
                    }

                    function getPrimaryScrollAxis(gestureEvt) {
                        // gets whether the user is primarily scrolling on the X or Y
                        // If a majority of the drag has been on the Y since the start of
                        // the drag, but the X has moved a little bit, it's still a Y drag

                        if (primaryScrollAxis) {
                        // we already figured out which way they're scrolling
                            return primaryScrollAxis;
                        }

                        if (gestureEvt && gestureEvt.gesture) {
                            if (!startCoord) {
                                // get the starting point
                                startCoord = ionic.tap.pointerCoord(gestureEvt.gesture.srcEvent);
                            } else {
                                // we already have a starting point, figure out which direction they're going
                                var endCoord = ionic.tap.pointerCoord(gestureEvt.gesture.srcEvent);

                                var xDistance = Math.abs(endCoord.x - startCoord.x);
                                var yDistance = Math.abs(endCoord.y - startCoord.y);

                                var scrollAxis = (xDistance < yDistance ? 'y' : 'x');

                                if (Math.max(xDistance, yDistance) > 30) {
                                    // ok, we pretty much know which way they're going
                                    // let's lock it in
                                    primaryScrollAxis = scrollAxis;
                                }
                                return scrollAxis;
                            }
                        }
                        return 'x';
                    }

                    var content = {
                        element: element[0],
                        onDrag: function() {},
                        endDrag: function() {},
                        getTranslateY: function() {
                            return $scope.topMenuContentTranslateY || 0;
                        },
                        setTranslateY: ionic.animationFrameThrottle(function(amount) {
                            var yTransform = content.offsetY + amount;
                            $element[0].style[ionic.CSS.TRANSFORM] = 'translate3d(0,' + yTransform + 'px,0)';
                            $timeout(function() {
                                $scope.topMenuContentTranslateY = amount;
                            });
                        }),
                        setMarginTop: ionic.animationFrameThrottle(function(amount) {
                            if (amount) {
                                amount = parseInt(amount, 10);
                                $element[0].style[ionic.CSS.TRANSFORM] = 'translate3d(0,' + amount + 'px,0)';
                                $element[0].style.height = ($window.innerHeight - amount) + 'px';
                                content.offsetY = amount;
                            } else {
                                $element[0].style[ionic.CSS.TRANSFORM] = 'translate3d(0,0,0)';
                                $element[0].style.height = '';
                                content.offsetY = 0;
                            }
                        }),
                        setMarginBottom: ionic.animationFrameThrottle(function(amount) {
                            if (amount) {
                                amount = parseInt(amount, 10);
                                $element[0].style.height = ($window.innerHeight - amount) + 'px';
                                content.offsetY = amount;
                            } else {
                                $element[0].style.width = '';
                                content.offsetY = 0;
                            }
                            // reset incase left gets grabby
                            $element[0].style[ionic.CSS.TRANSFORM] = 'translate3d(0,0,0)';
                        }),
                        enableAnimation: function() {
                            $scope.animationEnabled = true;
                            $element[0].classList.add('topmenu-animated');
                        },
                        disableAnimation: function() {
                            $scope.animationEnabled = false;
                            $element[0].classList.remove('topmenu-animated');
                        },
                        offsetY: 0
                    };
                    topMenuCtrl.setContent(content);

                    // add gesture handlers
                    var gestureOpts = { stop_browser_behavior: false };
                    if (ionic.DomUtil.getParentOrSelfWithClass($element[0], 'overflow-scroll')) {
                        gestureOpts.prevent_default_directions = ['up', 'down'];
                    }
                    var contentTapGesture = $ionicGesture.on('tap', onContentTap, $element, gestureOpts);
                    var dragRightGesture = $ionicGesture.on('dragright', onDragX, $element, gestureOpts);
                    var dragLeftGesture = $ionicGesture.on('dragleft', onDragX, $element, gestureOpts);
                    var dragUpGesture = $ionicGesture.on('dragup', onDragY, $element, gestureOpts);
                    var dragDownGesture = $ionicGesture.on('dragdown', onDragY, $element, gestureOpts);
                    var releaseGesture = $ionicGesture.on('release', onDragRelease, $element, gestureOpts);

                    // Cleanup
                    $scope.$on('$destroy', function() {
                        if (content) {
                            content.element = null;
                            content = null;
                        }
                        $ionicGesture.off(dragLeftGesture, 'dragleft', onDragX);
                        $ionicGesture.off(dragRightGesture, 'dragright', onDragX);
                        $ionicGesture.off(dragUpGesture, 'dragup', onDragY);
                        $ionicGesture.off(dragDownGesture, 'dragdown', onDragY);
                        $ionicGesture.off(releaseGesture, 'release', onDragRelease);
                        $ionicGesture.off(contentTapGesture, 'tap', onContentTap);
                    });
                }
            }
        };
    }
}(ionic));