(function ($) {
    //分页控件
    function datalist(zp,options) {
        var self = this;
        self.options = $.extend(self.options, options);//私有变量
        self.zepto = zp;
        self.init();
    };

    datalist.prototype = {
        options: {page: 1, rows: 5, total: 0},
        zepto:null,
        template: '',
        btnHtml: '',
        init: function () {
            var self = this;
            self.load();
            return this;
        },
        formatter: function (rows) {
            var self = this;
            var html = '';
            for (var i = 0; i < rows.length; i++) {
                rows[i].index = i;
                html += self.template.replace(/[{]{2}\w+[}]{2}/g,
                    function (m, p1, p2) {
                        return rows[i][m.substring(2, m.length - 2)];
                    });
                var buttons = self.options.buttons;
                if (buttons && buttons.length > 0) {
                    for (var j = 0; j < buttons.length; j++) {
                        var button = buttons[j];
                        self.btnHtml += '<span class="' + button.btnCls + '" data-index="' + i + '">' + button.text + '</span>';
                    }
                }
            }
            return html;
        },
        load: function () {
            this.options.page = 1;
            this.reload();
        },
        reload: function () {
            var self = this;
            var el = $.loading({content: '加载中...'});
            $.post(self.options.url, $.extend({
                page: self.options.page,
                rows: self.options.rows
            }, self.options.getQueryParams()), function (data) {
                var $dg = self.zepto;
                if (!self.isInited) {
                    // 第一次加载 需要初始化分页控件
                    self.isInited = true;
                    self.template = $('#dg').html();
                    $dg.html(self.formatter(data.rows)).show()
                        .parent().append(self.btnHtml + '<div class="ui-footer ui-footer-stable ui-btn-group ui-border-t"><button id="btnFirst" class="ui-btn-lg ui-btn-primary">首页</button><button id="btnPrev" class="ui-btn-lg ui-btn-primary">上一页</button><button id="btnNext" class="ui-btn-lg ui-btn-primary">下一页</button><button id="btnLast" class="ui-btn-lg ui-btn-primary">尾页</button></div>');
                    // 绑定翻页控件
                    $('button.ui-btn-lg').click(function () {
                        self.options.page = self.options.page || 1;
                        switch (this.id) {
                            case 'btnFirst':
                                self.options.page = 1;
                                break;
                            case 'btnPrev':
                                self.options.page--;
                                break;
                            case 'btnNext':
                                self.options.page++;
                                break;
                            case 'btnLast':
                                self.options.page = Math.ceil(self.options.total * 1.0 / self.options.rows);
                                break;
                        }
                        self.reload();
                    });
                } else {
                    // 再次加载，不用初始化分页控件
                    $dg.html(self.formatter(data.rows));
                }

                var clientWidth, height, startLeft, startPositionX, startPositionY, endPositionX, deltaX, btnWidth, btnEditWidth, btnDelWidth;// 按钮宽度
                //todo 遍历buttons 并定位
                $('.hw-btn-delete').each(function () {
                    var $self = $(this);
                    var index = parseInt($self.attr('data-index'));
                    var windowWidth = window.innerWidth;
                    btnDelWidth = $self.width();
                    height = $('#dg>li').first().height();
                    $self.css({
                        height: (height) + 'px',
                        'line-height': height + 'px',
                        left: (windowWidth - btnDelWidth) + 'px',
                        top: (index * height) + 'px'
                    });
                });
                $('.hw-btn-edit').each(function () {
                    var $self = $(this);
                    var index = parseInt($self.attr('data-index'));
                    var windowWidth = window.innerWidth;
                    btnEditWidth = $self.width();
                    btnWidth = btnDelWidth + btnEditWidth;
                    $self.css({
                        height: (height) + 'px',
                        'line-height': height + 'px',
                        left: (windowWidth - btnWidth) + 'px',
                        top: (index * height) + 'px'
                    });
                });

                //绑定列表
                $('#dg>li').bind('touchstart', function (e) {
                    var $self = $(this);
                    var touch = e.touches[0];
                    startPositionX = touch.pageX;
                    startPositionY = touch.pageY;
                    clientWidth = $(this)[0].clientWidth;
                    startLeft = $self.offset().left;
                    //解决android下touchmove只执行一下,touchend不触发的bug
                    event.preventDefault();
                }).bind('touchmove', function (e) {
                    var $self = $(this);
                    var touch = e.touches[0];
                    //android下 表达式中直接访问对象的属性值为空
                    endPositionX = touch.pageX;
                    deltaX = endPositionX - startPositionX;
                    if (deltaX < 0) { // 向左划动
                        $('#li-search').html(deltaX);
                        if (-startLeft - deltaX <= btnWidth) {//两个按钮宽度之内
                            //todo left 不是从deltaX曲奇
                            $self.css({left: startLeft + deltaX + 'px', 'z-index': 9999}).siblings().css({
                                left: 0,
                                'z-index': 0
                            });
                        } else {
                            //todo 字体滑动 暂不做
                        }
                    } else {//  向右划动
                        if (-startLeft - deltaX <= btnDelWidth) {//一个按钮距离之内
                            slide($self, deltaX, 0);
                        } else if (-startLeft - deltaX <= btnWidth) {//两个按钮宽度之内
                            //todo $self停止左滑,$self中的内容左滑
                            slide($self, deltaX, -btnWidth);
                        } else {
                            //todo 字体滑动恢复
                        }
                        //slide($self, left, 0);
                    }
                }).bind('touchend', function (e) {
                    var $self = $(this);
                    var left = $self.offset().left;
                    if (deltaX < 0) { // 向左划动
                        if (-startLeft - deltaX <= btnDelWidth) {//一个按钮距离之内
                            slide($self, deltaX, 0);
                        } else if (-startLeft - deltaX <= btnWidth) {//两个按钮宽度之内
                            //todo $self停止左滑,$self中的内容左滑
                            slide($self, deltaX, -btnWidth);
                        } else {
                            //todo 字体滑动恢复
                        }
                    }
                });

                //  划动
                function slide($self, deltaX, end) {
                    var Hooke = 0.1; //弹性系数
                    var left = deltaX;
                    deltaX -= end;
                    var deltaXSqure = deltaX * deltaX;
                    var sign = deltaX < 0 ? -1 : 1;
                    var intervalId = window.setInterval(function () {
                        var shift = end - left;
                        shift *= sign;
                        var step = Hooke * Math.sqrt(deltaXSqure - shift * shift);
                        step = step == 0 ? 0.1 : step;
                        step *= sign;
                        $self.css({left: left -= step, 'z-index': 0});
                        if (shift > 0) {
                            clearInterval(intervalId);
                        }
                    }, 10);
                }

                // 分页控件启用与禁用
                if (self.options.page > 1) {
                    $('#btnPrev').removeAttr('disabled');
                    $('#btnFirst').removeAttr('disabled');
                } else {
                    $('#btnPrev').attr('disabled', 'diabled');
                    $('#btnFirst').attr('disabled', 'diabled');
                }
                self.options.total = data.total;
                var totalPage = Math.ceil(self.options.total * 1.0 / self.options.rows);
                if (self.options.page < totalPage) {
                    $('#btnNext').removeAttr('disabled');
                    $('#btnLast').removeAttr('disabled');
                } else if (self.options.page > totalPage) {
                    self.options.page = totalPage;
                    self.reload();
                } else {
                    $('#btnNext').attr('disabled', 'diabled');
                    $('#btnLast').attr('disabled', 'diabled');
                }
                self.options.pageIndex = data.PageIndex;
                el.loading("hide");
            }, 'json');
        }
    };

    /**
     * @数据列表zepto方法
     * @param arg1 {Object|String} 初始化对象或方法名
     * @param arg2 {Object} 给调用方法传递的参数
     * */
    $.fn.datalist = function (arg1, arg2) {
        var self = this;
        var type = typeof(arg1);
        switch (type) {
            case 'object':
                $.fn.datalist.obj = new datalist(self,arg1);
                break;
            case 'string':
                if (typeof($.fn.datalist.method[arg1]) === 'function') {
                    $.fn.datalist.method[arg1](arg2);
                } else {
                    console.error('未找到方法' + arg1);
                }
                break;
        }
    };

    /**
     * @方法对象
     * */
    $.fn.datalist.method = {
        load: function () {
            var obj = $.fn.datalist.obj;
            if (obj) {
                obj.load();
            }
        },
        reload: function () {
            var obj = $.fn.datalist.obj;
            if (obj) {
                obj.reload();
            }
        },
        deleteRow: function (index) {
            var obj = $.fn.datalist.obj;
            if (obj) {
                //todo 实现删除行方法
            }
        }
    };
})(Zepto);
