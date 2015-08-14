/**
 * Created by user1 on 2015/8/12.
 */
(function ($) {
    /**
     * @选择组件对象构造方法
     * @authoer 陈柄宏
     * @date 2015-8-12
     * @param zp {Zepto Object} 要绑定到的Zepto对象
     * @param options {Object} 初始化参数
     * */
    var combobox = function (zp, options) {
        var self = this;
        self.options = $.extend(self.options, options);//私有变量
        self.zepto = zp;
        self.zeptoId = zp.attr('id');
        self.init();
    };
    //@选择组件对象原型
    //@author 陈柄宏
    //@date 2015-8-12
    combobox.prototype = {
        dialog: null,
        datalist: null,
        zepto: null,
        hideZepto: null,
        zeptoId: '',
        selectedValue: [],
        selectedText: [],
        options: {
            url: '',
            valueField: '',
            textField: '',
            multiple: false,
            separator: ',',
            title: ''
        },
        init: function () {
            var self = this;
            var zp = self.zepto;
            //打开选择组件
            zp.focus(function () {
                self.open();
            });
        },
        onLoadSuccess: function () {
        },
        load: function () {
        },
        reload: function () {
        },
        getRow: function () {
        },
        getValues: function () {
            var self = this;
            return self.selectedValue;
        },
        setValues: function (values) {
            //todo 修改 不需要从后台获取textField
            var self = this;
            var idList = values.join(self.options.separator);
            self.hideZepto.val(idList);
            //todo 获取textValue使用后台数据测试
            $.post(self.options.url, {IdList: idList, Separator: self.options.separator}, function (data) {
                var nameList = [];
                var rows=data.rows;
                for (var i = 0; i < data.total; i++) {
                    nameList.push(rows[i][self.options.textField]);
                }
                self.selectedText=nameList.join(self.options.separator);
                self.zepto.val(self.selectedText);
            }, 'json');
        },
        getText: function () {
            var self = this;
            return self.selectedText.join(self.options.separator);
        },
        open: function () {
            var self = this;
            //第一次加载
            if(!self.datalist){
                //生成列表
                initDataList(self);
                //绑定控件事件
                bindEvent(self);
            }else{
                //重新加载
                self.datalist.datalist('load');
            }
            self.dialog.show();
        },
        close: function () {
            var self = this;
            self.dialog.hide();
        },
        sure: function () {
            var self = this;
            self.setValues(self.getValues());
            self.close();
        },
        clear: function () {
            var self = this;
            var zp = self.zepto;
            var zpId = self.zeptoId;
            self.selectedText = '';
            self.selectedValue = [];
            var $inputs = $('#dl-' + zpId + ' li input[name=' + self.options.textField + ']');
            $inputs.each(function () {
                var $self = $(this);
                //attr会选中最后一个
                $self.prop('checked', false);
            });
        }
    };
    /**
     * @初始化数据列表
     * @author 陈柄宏
     * @date 2015-8-14
     * @param self {Object} 选择组件对象实例
     * */
    function initDataList(self) {
        var zp = self.zepto;
        var zpId = self.zeptoId;
        var html = '<input id="hid-{{comboId}}" type="hidden"/>\n<div id="dlg-{{comboId}}"\n     style="display: none; width: 100%; height: 100%; border: solid 1px #ccc; position: absolute; top: 0;">\n    <header id="header" class="ui-header ui-header-positive ui-border-b" style="z-index: 1;">\n        <ul class="ui-tiled">\n            <li style="width: 8%;">\n                <i id="iCancel-{{comboId}}" class="iconfont">&#xe610;</i>\n            </li>\n            <li id="liComQry" style="width: 84%; text-align: right;">{{comboTitle}}</i>\n            </li>\n            <li style="width: 8%;">\n                <button id="btnSure-{{comboId}}" class="ui-btn">\n                    确定\n                </button>\n            </li>\n        </ul>\n    </header>\n    <div class="ui-dlg-content" style="position: absolute; top: 45px; width:100%;">\n        <table id="tbSearch" style="width:100%; padding: 3px; position: absolute; top: 0px; ">\n            <tr>\n                <td>\n                    <label id="lbSearch-{{comboId}}" class="item item-input"\n                           style="display: inline-block; border: 1px solid #ccc; line-height: 25px; padding:2px 5px; width:100%; margin-left:5px;">\n                        <i class="iconfont" style="float:left; margin-top:2px;">&#xe60b;</i>\n                        <i id="iClearSearch-{{comboId}}" class="iconfont" style="float:right;margin-top:2px;">\n                            &#xe609;</i>\n                        <input id="txtSearch-{{comboId}}" placeholder="搜索{{comboTitle}}" type="text"\n                               style="width:80%;"/>\n                    </label>\n                </td>\n                <td style="width:100px; text-align:right;">\n                    <button id="btnSearch-{{comboId}}" class="ui-btn ui-btn-primary"\n                            style=" margin-right:10px;">搜索\n                    </button>\n                </td>\n            </tr>\n        </table>\n        <section class="ui-container" style="position: relative; top:45px; border-top-width: 0;">\n            <ul id="dl-{{comboId}}" class="hw-datalist ui-list ui-list-text ui-border-b" style="display: none;">\n                <li data-index="{{index}}" class="ui-border-t" style="border-right: 1px solid #e0e0e0;">\n                    <label class="ui-{{type}}" for="chk-{{id}}">\n                        <input id="chk-{{comboId}}-{{valueField}}" type="{{type}}" name="{{name}}"\n                               value="{{valueField}}"\n                               title="{{textField}}"/>\n                        {{textField}}\n                    </label>\n                </li>\n            </ul>\n            <div class="ui-footer ui-footer-stable ui-btn-group ui-border-t">\n                <button class="hw-btn-paged hw-btn-paged-prev ui-btn-lg ui-btn-primary">上一页</button>\n                <button class="hw-btn-paged hw-btn-paged-next ui-btn-lg ui-btn-primary">下一页</button>\n                <button id="btnClear-{{comboId}}" class="ui-btn-lg ui-btn-primary">清空</button>\n                <button id="btnSelected-{{comboId}}" class="ui-btn-lg ui-btn-primary">已选择(0)</button>\n            </div>\n        </section>\n    </div>\n    <div id="divSelected" style="position: absolute; right: 10px; display: none;">\n    </div>\n</div>\n    ';
        var type = self.options.multiple ? 'checkbox' : 'radio';
        var valueField = self.options.valueField;
        var textField = self.options.textField;
        var title = self.options.title;
        html = formatter(html, {
            comboId: zpId,
            comboTitle: title,
            type: type,
            name: textField,
            valueField: '{{' + valueField + '}}',
            textField: '{{' + textField + '}}'
        });
        zp.after(html);
        self.hideZepto = $('#hid-' + zpId);
        self.datalist = $('#dl-' + zpId);
        self.dialog = $('#dlg-' + zpId);
        self.selectedValue = $('#hid-' + self.zeptoId).val().split(',');
        filter(self.selectedValue, '');
        var texts = zp.val().split(self.options.separator);
        filter(texts, '');
        self.selectedText = texts.join(self.options.separator);
        var $dl = self.datalist;
        var options = self.options;
        //初始化选择控件
        $dl.datalist({
            url: options.url,
            getQueryParams: function () {
                return {Key_Words: $('#txtSearch-' + zpId).val()};
            },
            onLoadSuccess: function (data) {
                //调用用户提供的方法
                self.options.onLoadSuccess();
                //选择框 赋值 绑定事件
                self.selectedValue = $('#hid-' + zpId).val().split(',');
                //过滤空字符串
                filter(self.selectedValue, '');
                var $inputs = $('#dl-' + zpId + ' li input[name=' + self.options.textField + ']');
                $inputs.each(function () {
                    var $self = $(this);
                    //选择框选中
                    $self.removeAttr('checked');
                    var value = $self.val();
                    var index = self.selectedValue.indexOf(value);
                    if (index != -1) {
                        //$self.attr('checked', true);
                        $self.click();
                    }
                    //选择框选中事件绑定
                    var type = $self.attr('type');
                    switch (type) {
                        case 'checkbox':
                            $self.click(function () {
                                var index = self.selectedValue.indexOf(value);
                                if ($self.attr('checked')) {
                                    if (index == -1) {
                                        self.selectedValue.push(value);
                                    }
                                } else {
                                    if (index >= 0) {
                                        self.selectedValue.splice(index, 1);
                                    }
                                }
                                $('#btnSelected-' + zpId).html('已选择(' + self.selectedValue.length + ')')
                            });
                            break;
                        case 'radio':
                            var index = self.selectedValue.indexOf(value);
                            $self.click(function () {
                                self.selectedValue = [value];
                                $('#btnSelected-' + zpId).html('已选择(' + self.selectedValue.length + ')')
                                self.sure();
                            });
                            break;
                    }
                });
            }
        });
    }
    /**
     * @绑定事件
     * @author 陈柄宏
     * @date 2015-8-14
     * @param self {Object} 选择组件对象实例
     * */
    function bindEvent(self) {
        var zpId = self.zeptoId;
        //关闭选组件
        $('#iCancel-' + zpId).unbind('click').click(function () {
            self.close();
        });
        //搜索
        $('#btnSearch-' + zpId).click(function () {
            self.datalist.datalist('load');
        });
        //清空搜索
        $('#iClearSearch-' + zpId).click(function () {
            $('#txtSearch-' + zpId).val('');
        });
        //确定选择 todo 测试
        $('#btnSure-' + zpId).click(function () {
            self.sure();
        });
        //清空选择 todo 已选择按钮html
        $('#btnClear-' + zpId).click(function () {
            self.clear();
        });
        //已选择按钮点击事件 todo 待测试
        $(document.body).append('<div id="divSelected-' + zpId + '" style="position: absolute; right: 10px; display: none;"></div>', null);
        var $btnSelected = $('#btnSelected-' + zpId);
        var $divSelected = $('#divSelected-' + zpId);
        $btnSelected.click(function () {
            $divSelected.css({
                bottom: $btnSelected.parent().height() + 'px',
                width: $btnSelected.width() + 'px'
            });
            if ($divSelected.css('display') === 'none') {
                var html = '<ul id="ulSelected-' + zpId + '" class="hw-list ui-list ui-list-pure ui-border-b">';
                var texts = self.selectedText.split(self.options.separator);
                console.log('texts',texts);
                for (var i = 0; i < self.selectedValue.length; i++) {
                    var value = self.selectedValue[i];
                    var text = texts[i] || '没有';
                    html += '<li data-id="' + value + '" class="ui-border-t" style="text-align:center;">' + text + '</li>';
                }
                html += '</ul>';
                $divSelected.html(html).show();
                //todo li 绑定 左滑事件
                var clientWidth, startPositionX, endPositionX, deltaX, width;// 按钮宽度
                //绑定列表的划动事件
                $('#ulSelected-' + zpId + '>li').
                    bind('touchstart', function (e) {
                        var $self = $(this);
                        var touch = e.touches[0];
                        startPositionX = touch.pageX;
                        clientWidth = $(this)[0].clientWidth;
                        $self.css({'z-index': 9999}).siblings().css({left: 0, 'z-index': 0});
                        width = $self.width();
                        //解决android下touchmove只执行一下,touchend不触发的bug
                        event.preventDefault();
                    }).bind('touchmove', function (e) {
                        var $self = $(this);
                        var touch = e.touches[0];
                        //android下 表达式中直接访问对象的属性值为空
                        endPositionX = touch.pageX;
                        deltaX = endPositionX - startPositionX;
                        if (deltaX >= -width && deltaX <= 0) {//两个按钮宽度之内
                            $self.css({left: deltaX + 'px'});
                        }
                    }).bind('touchend', function (e) {
                        var $self = $(this);
                        if (deltaX >= -width / 4 && deltaX <= 0) {//一个按钮距离之内
                            $self.stretch(0, 0.01, 0.1);
                        } else if (deltaX >= -width && deltaX <= -width / 4) {//两个按钮宽度之内
                            $self.stretch(-width, 0.5, 0.1, function () {
                                $self.remove();
                                var value = $self.attr('data-id');
                                $('#chk-' + zpId + '-' + value).click();
                            });
                        }
                    });
            } else {
                $divSelected.hide();
            }
        });
        //点击关闭已选择列表
        $(document).click(function () {
            var offset = $divSelected.offset();
            var clientX = event.clientX;
            var clientY = event.clientY;
            if (clientX <= offset.left || clientY <= offset.top) {
                if ($divSelected.css('display') != 'none') {
                    $divSelected.hide();
                }
            }
        });
    }
    /**
     * @选择组件公共接口
     * @authoer 陈柄宏
     * @date 2015-8-12
     * @param arg1 {Object|String} Object 初始化参数 String 调用方法名
     * @param arg2 {Object} 调用方法参数
     * */
    $.fn.combobox = function (arg1, arg2) {
        var self = this;
        var type = typeof(arg1);
        switch (type) {
            case 'object':
                $.fn.combobox.obj = new combobox(self, arg1);
                break;
            case 'string':
                if (typeof($.fn.combobox.method[arg1]) === 'function') {
                    //todo 考虑使用call来调用方法
                    $.fn.combobox.method[arg1](arg2);
                } else {
                    console.error('未找到方法' + arg1);
                }
                break;
        }
    };
    //@选择组件公共接口方法
    //@author 陈柄宏
    //@date 2015-8-12
    $.fn.combobox.method = {
        load: function () {
            var obj = $.fn.combobox.obj;
            if (obj) {
                if (typeof(obj.load) == 'function') {
                    obj.load();
                } else {
                    console.error('未找到方法load');
                }
            }
        },
        reload: function () {
            var obj = $.fn.combobox.obj;
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
            var obj = $.fn.combobox.obj;
            if (obj) {
                if (typeof(obj.getRow) == 'function') {
                    obj.getRow(index);
                } else {
                    console.error('未找到方法getRow');
                }
            }
        },
        clear: function () {
            //todo 实现清除选中功能
            var obj = $.fn.combobox.obj;
            if (obj) {
                if (typeof(obj.clear) == 'function') {
                    obj.clear();
                } else {
                    console.error('未找到方法clear');
                }
            }
        },
        getValues: function () {
            //todo 实现清除选中功能
            var obj = $.fn.combobox.obj;
            if (obj) {
                if (typeof(obj.getValues) == 'function') {
                    obj.getValues();
                } else {
                    console.error('未找到方法getValues');
                }
            }
        },
        setValues: function (values) {
            var obj = $.fn.combobox.obj;
            if (obj) {
                if (typeof(obj.setValues) == 'function') {
                    obj.setValues(values);
                } else {
                    console.error('未找到方法setValues');
                }
            }
        },
        open: function () {
            //todo 实现清除选中功能
            var obj = $.fn.combobox.obj;
            if (obj) {
                if (typeof(obj.open) == 'function') {
                    obj.open();
                } else {
                    console.error('未找到方法open');
                }
            }
        },
        close: function () {
            //todo 实现清除选中功能
            var obj = $.fn.combobox.obj;
            if (obj) {
                if (typeof(obj.close) == 'function') {
                    obj.close();
                } else {
                    console.error('未找到方法close');
                }
            }
        }
    };
})(Zepto);