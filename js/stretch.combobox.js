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
                    console.error('δ�ҵ�����' + arg1);
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
                    console.error('δ�ҵ�����load');
                }
            }
        },
        reload: function () {
            var obj = $.fn.combobox.obj;
            if (obj) {
                if (typeof(obj.reload) == 'function') {
                    obj.reload();
                } else {
                    console.error('δ�ҵ�����reload');
                }
            }
        },
        getRow: function (index) {
            //todo ʵ�ָ���index��ȡ�����ݵķ���
            var obj = $.fn.combobox.obj;
            if (obj) {
                if (typeof(obj.getRow) == 'function') {
                    obj.getRow(index);
                } else {
                    console.error('δ�ҵ�����getRow');
                }
            }
        },
        clear:function(){
            //todo ʵ�����ѡ�й���
            var obj = $.fn.combobox.obj;
            if (obj) {
                if (typeof(obj.clear) == 'function') {
                    obj.clear();
                } else {
                    console.error('δ�ҵ�����clear');
                }
            }
        },
        getValues:function(){
            //todo ʵ�����ѡ�й���
            var obj = $.fn.combobox.obj;
            if (obj) {
                if (typeof(obj.getValues) == 'function') {
                    obj.getValues();
                } else {
                    console.error('δ�ҵ�����getValues');
                }
            }
        },
        open:function(){
            //todo ʵ�����ѡ�й���
            var obj = $.fn.combobox.obj;
            if (obj) {
                if (typeof(obj.open) == 'function') {
                    obj.open();
                } else {
                    console.error('δ�ҵ�����open');
                }
            }
        },
        close:function(){
            //todo ʵ�����ѡ�й���
            var obj = $.fn.combobox.obj;
            if (obj) {
                if (typeof(obj.close) == 'function') {
                    obj.close();
                } else {
                    console.error('δ�ҵ�����close');
                }
            }
        }
    };
})(Zepto);