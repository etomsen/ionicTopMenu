(function(ionic){
    'use strict';
    ionic.views.TopMenu = ionic.views.View.inherit({
        initialize: function(opts) {
            this.el = opts.el;
            this.isEnabled = (typeof opts.isEnabled === 'undefined') ? true : opts.isEnabled;
            this.setHeight(opts.height);
        },
        getFullHeight: function() {
            return this.height;
        },
        setHeight: function(height) {
            this.height = height;
            this.el.style.height = height + 'px';
        },
        setIsEnabled: function(isEnabled) {
            this.isEnabled = isEnabled;
        },
        bringUp: function() {
            if(this.el.style.zIndex !== '0') {
                this.el.style.zIndex = '0';
            }
        },
        pushDown: function() {
            if(this.el.style.zIndex !== '-1') {
                this.el.style.zIndex = '-1';
            }
        }
    });

    ionic.views.TopMenuContent = ionic.views.View.inherit({
        initialize: function(opts) {
            ionic.extend(this, {
                animationClass: 'topmenu-animated',
                onDrag: function() {},
                onEndDrag: function() {}
            }, opts);

            ionic.onGesture('drag', ionic.proxy(this._onDrag, this), this.el);
            ionic.onGesture('release', ionic.proxy(this._onEndDrag, this), this.el);
        },
        _onDrag: function(e) {
            this.onDrag && this.onDrag(e);
        },
        _onEndDrag: function(e) {
            this.onEndDrag && this.onEndDrag(e);
        },
        disableAnimation: function() {
            this.el.classList.remove(this.animationClass);
        },
        enableAnimation: function() {
            this.el.classList.add(this.animationClass);
        },
        getTranslateY: function() {
            return parseFloat(this.el.style[ionic.CSS.TRANSFORM].replace('translate3d(', '').split(',')[1]);
        },
        setTranslateY: ionic.animationFrameThrottle(function(y) {
            this.el.style[ionic.CSS.TRANSFORM] = 'translate3d(0, ' + y + 'px, 0)';
        })
    });
    angular
        .module('me.tomsen.ionicTopMenu')
        .service('$ionicTopMenuDelegate', ionic.DelegateService([
            'toggleTop',
            'toggleBottom',
            'getOpenRatio',
            'isOpen',
            'isOpenTop',
            'isOpenBottom',
            'canDragContent',
            'edgeDragThreshold'
            ]));
}(ionic));

