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
            self.bindPagination();
        },
        bindListButton: function () {
            var self = this;
            var zp = self.zepto;
            var btnWidth, firstBtnWidth;
            var buttons = self.options.buttons;
            if (buttons && buttons.length > 0) {
                btnWidth = 0;
                for (var j = buttons.length - 1; j >= 0; j--) {
                    var button = buttons[j];
                    var $buttons = $('span.' + button.btnCls);
                    if ($buttons.length > 0) {
                        var width = $buttons.first().width();
                        if (j == buttons.length - 1) {
                            firstBtnWidth = width;
                        }
                        btnWidth += width;//获取按钮总宽度
                    }
                    //按钮定位
                    $buttons.each(function () {
                        var $self = $(this);
                        var index = parseInt($self.attr('data-index'));
                        var windowWidth = window.innerWidth;
                        var height = zp.children().first().height();
                        $self.css({
                            height: (height) + 'px',
                            'line-height': height + 'px',
                            left: (windowWidth - btnWidth) + 'px',
                            top: (index * height) + 'px'
                        });
                        $self.click(function () {
                            var row = self.data.rows[index];
                            button.handler(index, row);
                        });
                    })
                }
            }
            //绑定列表的滑动事件
            zp.children().slider({
                hooke: 0.2,//胡克弹性系数
                totalWidth: btnWidth,//滑动最大范围
                threshold: firstBtnWidth//滑动弹开阈值
            });
        },
        controlPagination: function () {
            var self = this;
            var zp = self.zepto;
            var data=self.data;
            var $footer = zp.next('div.ui-footer');
            var $btnPagedFirst = $footer.find('button.hw-btn-paged-first'),
                $btnPagedLast = $footer.find('button.hw-btn-paged-last'),
                $btnPagedPrev = $footer.find('button.hw-btn-paged-prev'),
                $btnPagedNext = $footer.find('button.hw-btn-paged-next');
            if (self.options.page > 1) {
                if ($btnPagedFirst) {
                    $btnPagedFirst.removeAttr('disabled');
                }
                if ($btnPagedPrev) {
                    $btnPagedPrev.removeAttr('disabled');
                }
            } else {
                if ($btnPagedFirst) {
                    $btnPagedFirst.attr('disabled', 'disabled');
                }
                if ($btnPagedPrev) {
                    $btnPagedPrev.attr('disabled', 'disabled');
                }
            }
            self.options.total = data.total;
            var totalPage = Math.ceil(self.options.total * 1.0 / self.options.rows);
            if (self.options.page < totalPage) {
                if ($btnPagedLast) {
                    $btnPagedLast.removeAttr('disabled');
                }
                if ($btnPagedNext) {
                    $btnPagedNext.removeAttr('disabled');
                }
            } else if (self.options.page > totalPage) {
                self.options.page = totalPage;
                self.reload();
            } else {
                if ($btnPagedLast) {
                    $btnPagedLast.attr('disabled', 'disabled');
                }
                if ($btnPagedNext) {
                    $btnPagedNext.attr('disabled', 'disabled');
                }
            }
        },
        bindPagination: function () {
            // 绑定翻页控件
            var self = this;
            var zp = self.zepto;
            var $footer = zp.next('div.ui-footer');
            var $btnPagedFirst = $footer.find('button.hw-btn-paged-first'),
                $btnPagedLast = $footer.find('button.hw-btn-paged-last'),
                $btnPagedPrev = $footer.find('button.hw-btn-paged-prev'),
                $btnPagedNext = $footer.find('button.hw-btn-paged-next');

            $btnPagedFirst.click(function () {
                self.options.page = 1;
                self.reload();
            });
            $btnPagedLast.click(function () {
                self.options.page = Math.ceil(self.options.total * 1.0 / self.options.rows);
                self.reload();
            });
            $btnPagedNext.click(function () {
                self.options.page--;
                self.reload();
            });
            $btnPagedPrev.click(function () {
                self.options.page++;
                self.reload();
            });
        },
        genHtml: function (rows) {
            var self = this;
            var html = '';
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                row.index = i;
                html += formatter(self.template, row);
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
            var queryParams = {};
            if (self.options.getQueryParams) {
                queryParams = self.options.getQueryParams();
            }
            $.post(self.options.url, $.extend({
                page: self.options.page,
                rows: self.options.rows
            }, queryParams), function (data) {
                self.data = data;
                var zp = self.zepto;
                if (!self.isInited) {
                    // 第一次加载 需要初始化分页控件
                    self.isInited = true;
                    self.template = zp.html();
                    zp.html(self.genHtml(data.rows)).show();
                } else {
                    // 再次加载，不用初始化分页控件
                    zp.html(self.genHtml(data.rows));
                }
                if (self.btnHtml) {
                    zp.after(self.btnHtml);
                    //遍历buttons 定位 绑定点击事件
                    self.bindListButton();
                }
                // 分页控件启用与禁用
                self.controlPagination();
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
})
(Zepto);
