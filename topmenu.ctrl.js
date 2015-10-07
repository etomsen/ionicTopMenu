(function(){
    'use strict';
    angular
        .module('me.tomsen.ionicTopMenu')
        .controller('$ionicTopMenus', controllerFn);

    controllerFn.$inject = ['$scope', '$attrs', '$ionicTopMenuDelegate', '$ionicPlatform', '$ionicBody', '$ionicHistory', '$ionicScrollDelegate', 'IONIC_BACK_PRIORITY', '$rootScope'];

    function controllerFn($scope, $attrs, $ionicTopMenuDelegate, $ionicPlatform, $ionicBody, $ionicHistory, $ionicScrollDelegate, IONIC_BACK_PRIORITY, $rootScope) {
        var self = this;
        var topShowing, bottomShowing, isDragging;
        var startY, lastY, offsetY, isAboveExposed;
        var enableMenuWithBackViews = true;

        self.$scope = $scope;

        self.initialize = function(options) {
            self.top = options.top;
            self.bottom = options.bottom;
            self.setContent(options.content);
            self.dragThresholdY = options.dragThresholdY || 10;
            $ionicHistory.registerHistory(self.$scope);
        };

        self.setContent = function(content) {
            if (content) {
                self.content = content;

                self.content.onDrag = function(e) {
                    self._handleDrag(e);
                };

                self.content.endDrag = function(e) {
                    self._endDrag(e);
                };
            }
        };

        self.isOpenTop = function() {
            return self.getOpenAmount() > 0;
        };

        self.isOpenBottom = function() {
            return self.getOpenAmount() < 0;
        };

        self.toggleTop = function(shouldOpen) {
            if (isAboveExposed || !self.top.isEnabled) {return;}
            var openAmount = self.getOpenAmount();
            if (arguments.length === 0) {
                shouldOpen = openAmount <= 0;
            }
            self.content.enableAnimation();
            if (!shouldOpen) {
                self.openPercentage(0);
                $rootScope.$emit('$ionicTopMenuClose', 'top');
            } else {
                self.openPercentage(100);
                $rootScope.$emit('$ionicTopMenuOpen', 'top');
            }
        };

        self.toggleBottom = function(shouldOpen) {
            if (isAboveExposed || !self.bottom.isEnabled) {return;}
            var openAmount = self.getOpenAmount();
            if (arguments.length === 0) {
                shouldOpen = openAmount >= 0;
            }
            self.content.enableAnimation();
            if (!shouldOpen) {
                self.openPercentage(0);
                $rootScope.$emit('$ionicTopMenuClose', 'bottom');
            } else {
                self.openPercentage(-100);
                $rootScope.$emit('$ionicTopMenuOpen', 'bottom');
            }
        };

        self.toggle = function(side) {
            if (side === 'bottom') {
                self.toggleBottom();
            } else {
                self.toggleTop();
            }
        };

        self.close = function() {
            self.openPercentage(0);
            $rootScope.$emit('$ionicTopMenuClose', 'top');
            $rootScope.$emit('$ionicTopMenuClose', 'bottom');
        };

        self.getOpenAmount = function() {
            return self.content && self.content.getTranslateY() || 0;
        };

        self.getOpenRatio = function() {
            var amount = self.getOpenAmount();
            if (amount >= 0) {
                return amount / self.top.height;
            }
            return amount / self.bottom.height;
        };

        self.isOpen = function() {
            return self.getOpenAmount() !== 0;
        };

        self.getOpenPercentage = function() {
            return self.getOpenRatio() * 100;
        };

        self.openPercentage = function(percentage) {
            var p = percentage / 100;

            if (self.top && percentage >= 0) {
                self.openAmount(self.top.height * p);
            } else if (self.bottom && percentage < 0) {
                self.openAmount(self.bottom.height * p);
            }

            $ionicBody.enableClass((percentage !== 0), 'topmenu-open');

            freezeAllScrolls(false);
        };

        function freezeAllScrolls(shouldFreeze) {
            if (shouldFreeze && !self.isScrollFreeze) {
                $ionicScrollDelegate.freezeAllScrolls(shouldFreeze);

            } else if (!shouldFreeze && self.isScrollFreeze) {
                $ionicScrollDelegate.freezeAllScrolls(false);
            }
            self.isScrollFreeze = shouldFreeze;
        }

        self.openAmount = function(amount) {
            var maxTop = self.top && self.top.height || 0;
            var maxBottom = self.bottom && self.bottom.height || 0;

            if (!(self.top && self.top.isEnabled) && amount > 0) {
                self.content.setTranslateY(0);
                return;
            }

            if (!(self.bottom && self.bottom.isEnabled) && amount < 0) {
                self.content.setTranslateY(0);
                return;
            }

            if (topShowing && amount > maxTop) {
                self.content.setTranslateY(maxTop);
                return;
            }

            if (bottomShowing && amount < -maxBottom) {
                self.content.setTranslateY(-maxBottom);
                return;
            }

            self.content.setTranslateY(amount);

            if (amount >= 0) {
                topShowing = true;
                bottomShowing = false;

                if (amount > 0) {
                    self.bottom && self.bottom.pushDown && self.bottom.pushDown();
                    self.top && self.top.bringUp && self.top.bringUp();
                }
            } else {
                bottomShowing = true;
                topShowing = false;

                self.bottom && self.bottom.bringUp && self.bottom.bringUp();
                self.top && self.top.pushDown && self.top.pushDown();
            }
        };

        self.snapToRest = function(e) {
            self.content.enableAnimation();
            isDragging = false;

            var ratio = self.getOpenRatio();

            if (ratio === 0) {
                self.openPercentage(0);
                return;
            }

            var velocityThreshold = 0.3;
            var velocityY = e.gesture.velocityY;
            var direction = e.gesture.direction;

            if (ratio > 0 && ratio < 0.5 && direction === 'down' && velocityY < velocityThreshold) {
                self.openPercentage(0);
            }

            else if (ratio > 0.5 && direction === 'up' && velocityY < velocityThreshold) {
                self.openPercentage(100);
            }

            else if (ratio < 0 && ratio > -0.5 && direction === 'up' && velocityY < velocityThreshold) {
                self.openPercentage(0);
            }

            else if (ratio < 0.5 && direction === 'down' && velocityY < velocityThreshold) {
                self.openPercentage(-100);
            }

            else if (direction === 'down' && ratio >= 0 && (ratio >= 0.5 || velocityY > velocityThreshold)) {
                self.openPercentage(100);
            }

            else if (direction === 'up' && ratio <= 0 && (ratio <= -0.5 || velocityY > velocityThreshold)) {
                self.openPercentage(-100);
            }

            else {
                self.openPercentage(0);
            }
        };

        self.enableMenuWithBackViews = function(val) {
            if (arguments.length) {
                enableMenuWithBackViews = !!val;
            }
            return enableMenuWithBackViews;
        };

        self.isAboveExposed = function() {
            return !!isAboveExposed;
        };

        self.exposeAbove = function(shouldExposeAbove) {
            if (!(self.top && self.top.isEnabled) && !(self.bottom && self.bottom.isEnabled)) {
                return;
            }
            self.close();

            isAboveExposed = shouldExposeAbove;
            if (self.top && self.top.isEnabled) {
                self.content.setMarginTop(isAboveExposed ? self.top.height : 0);
            } else if (self.bottom && self.bottom.isEnabled) {
                self.content.setMarginBottom(isAboveExposed ? self.bottom.height : 0);
            }

            self.$scope.$emit('$ionicExposeAbove', isAboveExposed);
        };

        self.activeAboveResizing = function(isResizing) {
            $ionicBody.enableClass(isResizing, 'above-resizing');
        };

        self._endDrag = function(e) {
            freezeAllScrolls(false);

            if (isAboveExposed) {return;}

            if (isDragging) {
                self.snapToRest(e);
            }
            startY = null;
            lastY = null;
            offsetY = null;
        };

        self._handleDrag = function(e) {
            if (isAboveExposed || !$scope.dragContent) {return;}

            if (!startY) {
                startY = e.gesture.touches[0].pageY;
                lastY = startY;
            } else {
                lastY = e.gesture.touches[0].pageY;
            }

            if (!isDragging && Math.abs(lastY - startY) > self.dragThresholdY) {
                startY = lastY;

                isDragging = true;
                self.content.disableAnimation();
                offsetY = self.getOpenAmount();
            }

            if (isDragging) {
                self.openAmount(offsetY + (lastY - startY));
                freezeAllScrolls(true);
            }
        };

        self.canDragContent = function(canDrag) {
            if (arguments.length) {
                $scope.dragContent = !!canDrag;
            }
            return $scope.dragContent;
        };

        self.edgeThreshold = 25;
        self.edgeThresholdEnabled = false;
        self.edgeDragThreshold = function(value) {
            if (arguments.length) {
                if (angular.isNumber(value) && value > 0) {
                    self.edgeThreshold = value;
                    self.edgeThresholdEnabled = true;
                } else {
                    self.edgeThresholdEnabled = !!value;
                }
            }
            return self.edgeThresholdEnabled;
        };

        self.isDraggableTarget = function(e) {
            var shouldOnlyAllowEdgeDrag = self.edgeThresholdEnabled && !self.isOpen();
            var startY = e.gesture.startEvent && e.gesture.startEvent.center &&
            e.gesture.startEvent.center.pageY;

            var dragIsWithinBounds = !shouldOnlyAllowEdgeDrag ||
            startY <= self.edgeThreshold ||
            startY >= self.content.element.offsetHeight - self.edgeThreshold;

            var backView = $ionicHistory.backView();
            var menuEnabled = enableMenuWithBackViews ? true : !backView;
            if (!menuEnabled) {
                var currentView = $ionicHistory.currentView() || {};
                return backView.historyId !== currentView.historyId;
            }

            return ($scope.dragContent || self.isOpen()) &&
            dragIsWithinBounds &&
            !e.gesture.srcEvent.defaultPrevented &&
            menuEnabled &&
            !e.target.tagName.match(/input|textarea|select|object|embed/i) &&
            !e.target.isContentEditable &&
            !(e.target.dataset ? e.target.dataset.preventScroll : e.target.getAttribute('data-prevent-scroll') === 'true');
        };

        $scope.topMenuContentTranslateY = 0;

        var deregisterBackButtonAction = angular.noop;
        var closeTopMenu = angular.bind(self, self.close);

        $scope.$watch(function() {
            return self.getOpenAmount() !== 0;
        }, function(isOpen) {
            deregisterBackButtonAction();
            if (isOpen) {
                deregisterBackButtonAction = $ionicPlatform.registerBackButtonAction(
                    closeTopMenu,
                    IONIC_BACK_PRIORITY.sideMenu
                    );
            }
        });

        var deregisterInstance = $ionicTopMenuDelegate._registerInstance(
            self, $attrs.delegateHandle, function() {
                return $ionicHistory.isActiveScope($scope);
            }
            );

        $scope.$on('$destroy', function() {
            deregisterInstance();
            deregisterBackButtonAction();
            self.$scope = null;
            if (self.content) {
                self.content.element = null;
                self.content = null;
            }

            freezeAllScrolls(false);
        });

        self.initialize({
            top: {
                width: 275
            },
            bottom: {
                width: 275
            }
        });
    }
}());