/**
 * Created by user1 on 2015/8/12.
 */
(function ($) {
    var slider = function (zp, options) {
        var self = this;
        self.options = $.extend(self.options, options);//私有变量
        self.zepto = zp;
        self.startPosition = zp.offset();
        self.init();
    };

    slider.prototype = {
        options: {hooke: 0.2, startSpeed: 0.01},
        zepto: null,
        startPosition: {left: 0},
        init: function () {
            var self = this;
            var zp = self.zepto;
            var totalWidth = self.options.totalWidth;
            var threshold = self.options.threshold;
            var startSpeed = self.options.startSpeed;
            var hooke = self.options.hooke;
            if (!zp)return;
            var startLeft, startPositionX, endPositionX, deltaX, shift;
            zp.bind('touchstart', function (e) {
                var $self = $(this);
                var touch = e.touches[0];
                startPositionX = touch.pageX;
                startLeft = $self.offset().left;
                //解决android下touchmove只执行一下,touchend不触发的bug
                event.preventDefault();
            }).bind('touchmove', function (e) {
                var $self = $(this);
                var touch = e.touches[0];
                endPositionX = touch.pageX;
                //滑动距离
                deltaX = endPositionX - startPositionX;
                //当前位移量(相对于其实位置)
                shift = startLeft + deltaX;
                //确定滑动范围,防止过度滑动
                if (shift > 0) {
                    shift = 0;
                }
                if (shift < -totalWidth) {
                    shift = -totalWidth;
                }
                //滑块在滑动范围内跟着手势滑动
                $self.css({left: shift + 'px'}).siblings().css({left: 0});
            }).bind('touchend', function (e) {
                var $self = $(this);
                if (shift + threshold >= 0) {//未达到弹性阈值,弹回
                    $self.stretch(0, startSpeed, hooke);
                } else {//达到弹性阈值,弹开
                    $self.stretch(-totalWidth, 0.2, hooke);//初始速度稍大,弹开更流畅
                }
            });
        }
    };

    $.fn.stretch = function (end, startSpeed, hooke) {
        var $self = $(this);
        var start = $self.offset().left;
        var amplitude = end - start;
        var interval = 10;//ms
        var sign = amplitude > 0 ? 1 : -1;
        var amplitudeSqure = amplitude * amplitude;
        var speed = startSpeed;
        speed *= sign;
        var intervalId = setInterval(function () {
            $self.css({left: start += speed});
            var shift = end - start;
            if (amplitude * shift <= 0) {
                clearInterval(intervalId);
                $self.css({left: end});
            }
            speed = hooke * Math.sqrt(amplitudeSqure - shift * shift);
            speed = !isNaN(speed) && speed != 0 ? speed : startSpeed;
            speed *= sign;
        }, interval);
    };

    $.fn.slider = function (arg1, arg2) {
        var self = this;
        var type = typeof(arg1);
        switch (type) {
            case 'object':
                $.fn.slider.obj = new slider(self, arg1);
                break;
            case 'string':
                if (typeof($.fn.slider.method[arg1]) === 'function') {
                    $.fn.slider.method[arg1](arg2);
                } else {
                    console.error('未找到方法' + arg1);
                }
                break;
        }
    };

    $.fn.slider.method = {
        slide: function (params) {
            var obj = $.fn.slider.obj;
            if (obj) {
                if (typeof(obj.slide) == 'function') {
                    obj.slide(params);
                } else {
                    console.error('未找到方法slide');
                }
            }
        },
        reset: function () {
            var obj = $.fn.slider.obj;
            if (obj) {
                if (typeof(obj.reset) == 'function') {
                    obj.reset();
                } else {
                    console.error('未找到方法reset');
                }
            }
        }
    };
})(Zepto);