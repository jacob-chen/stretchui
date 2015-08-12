/**
 * Created by user1 on 2015/8/12.
 */
(function($){


    $.fn.combobox=function(arg1,arg2){
        var self = this;
        var type = typeof(arg1);
        switch (type) {
            case 'object':
                $.fn.combobox.obj = new combobox(self, arg1);
                break;
            case 'string':
                if (typeof($.fn.combobox.method[arg1]) === 'function') {
                    $.fn.combobox.method[arg1](arg2);
                } else {
                    console.error('未找到方法' + arg1);
                }
                break;
        }
    };

    $.fn.combobox.method ={
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
        clear:function(){
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
        getValues:function(){
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
        open:function(){
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
        close:function(){
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