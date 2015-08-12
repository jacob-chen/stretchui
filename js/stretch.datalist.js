(function ($) {
    //分页控件
    function datalist(zp, options) {
        var self = this;
        self.options = $.extend(self.options, options);//私有变量
        self.zepto = zp;
        self.init();
    };

    datalist.prototype = {
        options: {page: 1, rows: 5, total: 0},
        zepto: null,
        data: {},
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
                        self.btnHtml += '<span class="hw-btn-list ' + button.btnCls + '" data-index="' + i + '">' + button.text + '</span>';
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
                self.data = data;
                var $dl = self.zepto;
                if (!self.isInited) {
                    // 第一次加载 需要初始化分页控件
                    self.isInited = true;
                    self.template = $dl.html();
                    $dl.html(self.formatter(data.rows)).show()
                        .parent().append(self.btnHtml + '<div class="ui-footer ui-footer-stable ui-btn-group ui-border-t"><button id="btnFirst" class="ui-btn-lg ui-btn-primary">首页</button><button id="btnPrev" class="ui-btn-lg ui-btn-primary">上一页</button><button id="btnNext" class="ui-btn-lg ui-btn-primary">下一页</button><button id="btnLast" class="ui-btn-lg ui-btn-primary">尾页</button></div>');
                    // 绑定翻页控件
                    $('button.hw-btn-paged').click(function () {
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
                    $dl.html(self.formatter(data.rows));
                }

                //遍历buttons 定位 绑定点击事件
                var btnWidth, firstBtnWidth;
                var buttons = self.options.buttons;
                if (buttons && buttons.length > 0) {
                    btnWidth = 0;
                    for (var j = buttons.length - 1; j >= 0; j--) {
                        var button = buttons[j];
                        var $buttons = $('span.' + button.btnCls);
                        if ($buttons.length > 0) {
                            var _width = $buttons.first().width();
                            if (j == buttons.length - 1) {
                                firstBtnWidth = _width;
                            }
                            btnWidth += _width;
                        }
                        $buttons.each(function () {
                            var $self = $(this);
                            var index = parseInt($self.attr('data-index'));
                            var windowWidth = window.innerWidth;
                            var height = $dl.children().first().height();
                            $self.css({
                                height: (height) + 'px',
                                'line-height': height + 'px',
                                left: (windowWidth - btnWidth) + 'px',
                                top: (index * height) + 'px'
                            });
                            $self.click(function () {
                                var row = data.rows[index];
                                button.handler(row);
                            });
                        })
                    }
                }

                //绑定列表的滑动事件
                $dl.children().slider({
                    hooke: 0.2,
                    totalWidth: btnWidth,
                    threshold: firstBtnWidth
                });

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
                $.fn.datalist.obj = new datalist(self, arg1);
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
                if (typeof(obj.load) == 'function') {
                    obj.load();
                } else {
                    console.error('未找到方法load');
                }
            }
        },
        reload: function () {
            var obj = $.fn.datalist.obj;
            if (obj) {
                if (typeof(obj.reload) == 'function') {
                    obj.reload();
                } else {
                    console.error('未找到方法reload');
                }
            }
        },
        getRow: function (index) {
            //todo 实现根据index获取行数据的方法
            var obj = $.fn.datalist.obj;
            if (obj) {
                if (typeof(obj.getRow) == 'function') {
                    obj.getRow(index);
                } else {
                    console.error('未找到方法getRow');
                }
            }
        },
        deleteRow: function (index) {
            //todo 实现删除行方法
            var obj = $.fn.datalist.obj;
            if (obj) {
                if (typeof(obj.deleteRow) == 'function') {
                    obj.deleteRow(index);
                } else {
                    console.error('未找到方法deleteRow');
                }
            }
        }
    };
})(Zepto);
