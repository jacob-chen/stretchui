/**
 * Created by user1 on 2015/8/12.
 */
(function ($) {
    var slider = function (zp, options) {
        var self = this;
        self.options = $.extend(self.options, options);//˽�б���
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
            if (!zp)return;
            var startLeft, startPositionX, endPositionX, deltaX, shift;
            zp.bind('touchstart', function (e) {
                var $self = $(this);
                var touch = e.touches[0];
                startPositionX = touch.pageX;
                startPositionY = touch.pageY;
                startLeft = $self.offset().left;
                //���android��touchmoveִֻ��һ��,touchend��������bug
                event.preventDefault();
            }).bind('touchmove', function (e) {
                var $self = $(this);
                var touch = e.touches[0];
                endPositionX = touch.pageX;
                //��������
                deltaX = endPositionX - startPositionX;
                //��ǰλ����(�������ʵλ��)
                shift = startLeft + deltaX;
                //ȷ��������Χ,��ֹ���Ȼ���
                if (shift > 0) {
                    shift = 0;
                }
                if (shift < -totalWidth) {
                    shift = -totalWidth;
                }
                //�����ڻ�����Χ�ڸ������ƻ���
                $self.css({left: shift + 'px'}).siblings().css({left: 0});
            }).bind('touchend', function (e) {
                var $self = $(this);
                if (shift + threshold >= 0) {//δ�ﵽ������ֵ,����
                    self.slide({zp: $self, end: 0});
                } else {//�ﵽ������ֵ,����
                    self.slide({zp: $self, end: -totalWidth, startSpeed: 0.2});//��ʼ�ٶ��Դ�,����������
                }
            });
        },
        slide: function (params) {
            var self = this;
            var end = params.end;
            var startSpeed = params.startPosition || self.options.startSpeed;
            var zp = params.zp;
            var start = zp.offset().left;
            var hooke = self.options.hooke;
            var amplitude = end - start;
            var sign = amplitude > 0 ? 1 : -1;
            var shiftSqure = amplitude * amplitude;
            var speed = startSpeed;
            speed *= sign;
            var intervalId = window.setInterval(function () {
                zp.css({left: start += speed});
                var shift = end - start;
                if (amplitude * shift <= 0) {
                    clearInterval(intervalId);
                    zp.css({left: end});
                }
                speed = hooke * Math.sqrt(shiftSqure - shift * shift);
                speed = speed != 0 ? speed : startSpeed;
                speed *= sign;
            }, 10);
        },
        reset: function () {
            var self = this;
            var zp = self.zepto;
            console.log('startPosition', self.startPosition);
            zp.css(self.startPosition);
        }
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
                    console.error('δ�ҵ�����' + arg1);
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
                    console.error('δ�ҵ�����slide');
                }
            }
        },
        reset: function () {
            var obj = $.fn.slider.obj;
            if (obj) {
                if (typeof(obj.reset) == 'function') {
                    obj.reset();
                } else {
                    console.error('δ�ҵ�����reset');
                }
            }
        }
    };
})(Zepto);