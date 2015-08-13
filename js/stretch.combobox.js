/**
 * Created by user1 on 2015/8/12.
 */
(function ($) {
    var combobox = function (zp, options) {
        var self = this;
        self.options = $.extend(self.options, options);//私有变量
        self.zepto = zp;
        self.zeptoId = zp.attr('id');
        self.init();
    };

    combobox.prototype = {
        dialog: null,
        datalist: null,
        zepto: null,
        valueZepto: null,
        zeptoId: '',
        selectedValue: [],
        selectedText: '',
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
            var zpId = self.zeptoId;
            if (!self.datalist) {
                var html = '<input id="hid-{{comboId}}" type="hidden"/>\n<div id="dlg-{{comboId}}"\n     style="display: none; width: 100%; height: 100%; border: solid 1px #ccc; position: absolute; top: 0;">\n    <header id="header" class="ui-header ui-header-positive ui-border-b" style="z-index: 1;">\n        <ul class="ui-tiled">\n            <li style="width: 8%;">\n                <i id="iCancel-{{comboId}}" class="iconfont">&#xe610;</i>\n            </li>\n            <li id="liComQry" style="width: 84%; text-align: right;">{{comboTitle}}</i>\n            </li>\n            <li style="width: 8%;">\n                <button id="btnSure-{{comboId}}" class="ui-btn">\n                    确定\n                </button>\n            </li>\n        </ul>\n    </header>\n    <div class="ui-dlg-content" style="position: absolute; top: 45px; width:100%;">\n        <div id="divSearch-{{comboId}}" style="padding: 3px;">\n            <label id="lbSearch-{{comboId}}" class="item item-input"\n                   style="display: inline-block; border: 1px solid #ccc; line-height: 25px; width:90%;">\n                <i class="iconfont">&#xe60b;</i>\n                <input id="txtSearch-{{comboId}}" placeholder="搜索客户名称" type="text" style="padding-right: 0; width:90%;"/>\n                <i id="iClearSearch-{{comboId}}" class="iconfont" style="right:0px;">&#xe609;</i>\n            </label>\n            <button id="btnSearch-{{comboId}}" class="ui-btn ui-btn-primary" style="display: none; margin-right: 5px;">\n                搜索\n            </button>\n            <button id="btnCancelSearch-{{comboId}}" class="ui-btn ui-btn-primary" style="margin-right: 5px;">取消\n            </button>\n        </div>\n        <section class="ui-container" style="position: relative; border-top-width: 0;">\n            <ul id="dl-{{comboId}}" class="ui-list ui-list-text ui-border-b" style="display: none;">\n                <li data-index="{{index}}" class="ui-border-t" style="border-right: 1px solid #e0e0e0;">\n                    <label class="ui-{{type}}" for="chk-{{id}}">\n                        <input id="chk-{{valueField}}" type="{{type}}" name="{{valueField}}" value="{{valueField}}"\n                               title="{{textField}}"/>\n                        {{textField}}\n                    </label>\n                </li>\n            </ul>\n            <div class="ui-footer ui-footer-stable ui-btn-group ui-border-t">\n                <button class="hw-btn-paged hw-btn-paged-prev ui-btn-lg ui-btn-primary">上一页</button>\n                <button class="hw-btn-paged hw-btn-paged-next ui-btn-lg ui-btn-primary">下一页</button>\n                <button id="btnClear" class="ui-btn-lg ui-btn-primary">清空</button>\n                <button id="btnSelected" class="ui-btn-lg ui-btn-primary">已选择(0)</button>\n            </div>\n        </section>\n    </div>\n    <div id="divSelected" style="position: absolute; right: 10px; display: none;">\n    </div>\n</div>\n    ';
                var type = self.options.multiple ? 'checkbox' : 'radio';
                var valueField = self.options.valueField;
                var textField = self.options.textField;
                var title = self.options.title;
                html = formatter(html, {
                    comboId: zpId,
                    comboTitle: title,
                    type: type,
                    valueField: '{{' + valueField + '}}',
                    textField: '{{' + textField + '}}'
                });
                zp.after(html);
                self.valueZepto = $('#hid-' + zpId);
                self.datalist = $('#dl-' + zpId);
                self.dialog = $('#dlg-' + zpId);
            }
            var $dl = self.datalist;
            var options = self.options;
            $dl.datalist({
                url: options.url,
                onLoadSuccess: function () {
                    //调用用户提供的方法
                    self.options.onLoadSuccess();
                    //选择框 赋值 绑定事件
                    var values = $('#hid-' + zpId).val().split(',');
                    var $inputs = $('#dl-' + zpId + ' li input[name=' + self.options.valueField + ']');
                    //过滤空字符串
                    filter(values, '');
                    $inputs.each(function () {
                        var $self = $(this);
                        //选择框选中
                        $self.removeAttr('checked');
                        var value = $self.val();
                        var index = values.indexOf(value);
                        if (index != -1) {
                            $self.attr('checked', true);
                        }
                        //选择框选中事件绑定
                        var type = $self.attr('type');
                        switch (type) {
                            case 'checkbox':
                                $self.click(function () {
                                    var index = values.indexOf(value);
                                    if ($self.attr('checked')) {
                                        if (index == -1) {
                                            values.push(value);
                                        }
                                    } else {
                                        if (index >= 0) {
                                            values.splice(index, 1);
                                        }
                                    }
                                    //todo 已选择 按钮
                                    //    $btnSelected.html('已选择(' + CHECKEDITEM.length + ')');
                                });
                                break;
                            case 'radio':
                                var index = values.indexOf(value);
                                $self.click(function () {
                                    values = [value];
                                    //$btnSelected.html('已选择(' + CHECKEDITEM.length + ')');
                                    self.sure();
                                });
                                break;
                        }
                    });
                }
            });
            zp.focus(function () {
                self.open();
            });
            //todo 要不要做文本框后面按钮的点击事件打开选择器

            //todo 搜索框 样式 宽度调整

            //todo 返回按钮 待测试
            $('#iCancel-' + self.zeptoId).click(function () {
                self.close();
            });

            //todo 确定按钮 待测试
            $('#btnSure-'+self.zeptoId).click(function(){
                self.sure();
            });

            //todo 清空按钮 待测试
            $('#btnClear-'+self.zeptoId).click(function(){
                self.clear();
            });

            $('#btnSelected-'+self.zeptoId).click(function(){
                //todo 已选择按钮
            });
            //获取选中项
            self.selectedValue = $('#hid-' + zpId).val().split(',');
            //过滤空字符串
            filter(self.selectedValue, '');
            console.log('selectedValue', self.selectedValue);
            return;
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
            return self.selectedValue;
        },
        setValues: function (values) {

        },
        getText: function () {
            return self.selectedText;
        },
        open: function () {
            var self = this;
            self.dialog.show();
            self.datalist.datalist('load');
        },
        close: function () {
            var self = this;
            self.dialog.hide();
        },
        sure: function () {
            var self = this;
            //todo 给input赋值 待测试
            self.zepto.val(self.getText());
            self.valueZepto.val(self.getValues());
            self.close();
        },
        clear: function () {
            var self = this;
            var zp = self.zepto;
            var zpId = self.zeptoId;
            self.selectedText = '';
            self.selectedValue = [];
            //todo 选择框清除选中 待测试
            var $inputs = $('#dl-' + zpId + ' li input[name=' + self.options.valueField + ']');
            console.log('$inputs', $inputs);
            $inputs.each(function () {
                var $self = $(this);
                $self.removeAttr('checked');
                return;
                if ($self.attr('checked')) {
                    $self.click();
                }
            });
        }
    };

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