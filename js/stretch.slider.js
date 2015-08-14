/**
 * Created by user1 on 2015/8/12.
 */
(function ($) {
    /**
     * @������������췽��
     * @authoer �±���
     * @date 2015-8-12
     * @param zp {Zepto Object} Ҫ�󶨵���Zepto����
     * @param options {Object} ��ʼ������
     * */
    var slider = function (zp, options) {
        var self = this;
        self.options = $.extend(self.options, options);//˽�б���
        self.zepto = zp;
        self.startPosition = zp.offset();
        self.init();
    };
    //@�����������ԭ��
    //@author �±���
    //@date 2015-8-12
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
                    $self.stretch(0, startSpeed, hooke);
                } else {//�ﵽ������ֵ,����
                    $self.stretch(-totalWidth, 0.2, hooke);//��ʼ�ٶ��Դ�,����������
                }
            });
        }
    };
    /**
     * @����ָ��λ��
     * @authoer �±���
     * @date 2015-8-12
     * @param end {Number} ָ��λ��
     * @param startSpeed {Number} ��ʼ�ٶ�
     * @param hooke {Number} ����ϵ��
     * @param callBack {Function} ����ָ��λ��ʱ���õķ���
     * */
    $.fn.stretch = function (end, startSpeed, hooke,callBack) {
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
                if(typeof(callBack)=='function'){
                    callBack();
                }
            }
            speed = hooke * Math.sqrt(amplitudeSqure - shift * shift);
            speed = !isNaN(speed) && speed != 0 ? speed : startSpeed;
            speed *= sign;
        }, interval);
    };
    /**
     * @������������ӿ�
     * @authoer �±���
     * @date 2015-8-12
     * @param arg1 {Object|String} Object ��ʼ������ String ���÷�����
     * @param arg2 {Object} ���÷�������
     * */
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
    //@������������ӿڷ���
    //@author �±���
    //@date 2015-8-12
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