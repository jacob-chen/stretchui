//分页控件
function hwpage(options) {
    var _self = this;
    _self.options = $.extend(_self.options, options);//私有变量
    _self.init();
};

hwpage.prototype = {
    options: { page: 1, rows: 5, total: 0 },
    template: '',
    btnHtml: '',
    init: function () {
        var _self = this;
        _self.load();
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
        var _self = this;
        var el = $.loading({ content: '加载中...' });
        $.post(_self.options.url, $.extend({ page: _self.options.page, rows: _self.options.rows }, _self.options.getQueryParams()), function (data) {
            var $dg = $('#dg');
            if (!_self.isInited) {
                // 第一次加载 需要初始化分页控件
                _self.isInited = true;
                _self.template = $('#dg').html();
                $dg.html(_self.formatter(data.rows)).show()
                    .parent().append(_self.btnHtml + '<div class="ui-footer ui-footer-stable ui-btn-group ui-border-t"><button id="btnFirst" class="ui-btn-lg ui-btn-primary">首页</button><button id="btnPrev" class="ui-btn-lg ui-btn-primary">上一页</button><button id="btnNext" class="ui-btn-lg ui-btn-primary">下一页</button><button id="btnLast" class="ui-btn-lg ui-btn-primary">尾页</button></div>');
                // 绑定翻页控件
                $('button.ui-btn-lg').click(function () {
                    _self.options.page = _self.options.page || 1;
                    switch (this.id) {
                        case 'btnFirst':
                            _self.options.page = 1;
                            break;
                        case 'btnPrev':
                            _self.options.page--;
                            break;
                        case 'btnNext':
                            _self.options.page++;
                            break;
                        case 'btnLast':
                            _self.options.page = Math.ceil(_self.options.total * 1.0 / _self.options.rows);
                            break;
                    }
                    _self.reload();
                });
            } else {
                // 再次加载，不用初始化分页控件
                $dg.html(_self.formatter(data.rows));
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
                        $self.css({ left: startLeft + deltaX + 'px', 'z-index': 9999 }).siblings().css({ left: 0, 'z-index': 0 });
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
                    $self.css({ left: left -= step, 'z-index': 0 });
                    if (shift > 0) {
                        clearInterval(intervalId);
                    }
                }, 10);
            }

            // 分页控件启用与禁用
            if (_self.options.page > 1) {
                $('#btnPrev').removeAttr('disabled');
                $('#btnFirst').removeAttr('disabled');
            } else {
                $('#btnPrev').attr('disabled', 'diabled');
                $('#btnFirst').attr('disabled', 'diabled');
            }
            _self.options.total = data.total;
            var totalPage = Math.ceil(_self.options.total * 1.0 / _self.options.rows);
            if (_self.options.page < totalPage) {
                $('#btnNext').removeAttr('disabled');
                $('#btnLast').removeAttr('disabled');
            } else if (_self.options.page > totalPage) {
                _self.options.page = totalPage;
                _self.reload();
            } else {
                $('#btnNext').attr('disabled', 'diabled');
                $('#btnLast').attr('disabled', 'diabled');
            }
            _self.options.pageIndex = data.PageIndex;
            el.loading("hide");
        }, 'json');
    }
};

function getChecked(name) {
    var checked = '';
    $('input[name=' + name + ']:checked').forEach(function (e) {
        checked += $(e).val() + ',';
    });
    if (checked[checked.length - 1] == ',') {
        checked = checked.substring(0, checked.length - 1);
    }
    return checked;
}

//编辑表单
function hwwxform(options) {
    var _self = this;
    _self.options = $.extend(_self.options, options);//私有变量
};

hwwxform.prototype = {
    options: { Page_ID: "", PK_ID: 0, Edit_Field: "" },
    formData: [],
    load: function () {
        var _self = this;
        $.post(CurPage() + '?action=formdata', { Page_ID: _self.options.Page_ID, ID: _self.options.PK_ID }, function (data) {
            if (data.msg) {
                $("#Sec_Cont").html(data.msg);
            } else {
                _self.formData = data;

                var Html = [];
                Html.push('<ul class="ui-list ui-list-text ui-border-tb">');
                for (var i = 0; i < data.length; i++) {
                    if (data[i].Allow_Edit == '1') {
                        Html.push('<li class="ui-border-t hwwxform-edit" editdata="' + data[i].Field_ID + '">');
                    } else {
                        Html.push('<li class="ui-border-t">');
                    }

                    Html.push('<div class="ui-list-info">');
                    Html.push('<h4 class="ui-nowrap">' + data[i].Input_Title + '</h4>');
                    Html.push('</div>');
                    if (data[i].Allow_Edit == '1') {
                        Html.push('<div class="ui-menusowlink"></div>');
                    }
                    Html.push('</li><li><div class="ui-list-info" style="padding-left: 20px;"><h4 class="ui-nowrap">' + data[i].Show_Value + '</h4></div></li>');
                }
                Html.push('</ul>');

                $("#Sec_Cont").html(Html.join(''));

                //绑定事件
                $('.hwwxform-edit').click(function () {
                    var _fieldID = this.getAttribute("editdata");
                    _self.options.Edit_Field = _fieldID;
                    _self.showEdit(_fieldID);
                });
            }
        }, 'json');
    },
    //显示编辑界面
    showEdit: function (FieldID) {
        var _self = this;
        //取出表单数据
        var _formData = _self.formData;
        var Field_Value, Input_Type, Input_Title;

        for (var i = 0; i < _formData.length; i++) {
            if (_formData[i].Field_ID == FieldID) {
                Field_Value = _formData[i].Field_Value;
                Input_Type = parseInt(_formData[i].Input_Type);
                Input_Title = _formData[i].Input_Title;
                break;
            }
        }

        var Form_Cont = [];
        Form_Cont.push('<ul class="ui-list ui-list-text"><li><div class="ui-list-info">');

        switch (Input_Type) {
            case 1: //文本框
                Form_Cont.push('<textarea placeholder="请输入' + Input_Title + '" class="ui-form-item-textarea" style="width: 100%;">' + Field_Value + '</textarea>');
                break;
        }
        Form_Cont.push('</div></li></ul>');
        $("#Sec_Edit").html(Form_Cont.join(''));

        Form_Cont = [];
        Form_Cont.push('<i class="ui-icon-return" id="hwwxform-cancel"></i>');
        Form_Cont.push('<h1>' + Input_Title + '</h1>');
        Form_Cont.push('<button class="ui-btn" id="hwwxform-save">保存</button>');

        $("#Head_Edit").html(Form_Cont.join(''));

        //绑定事件
        $('#hwwxform-cancel').click(function () {
            _self.options.Edit_Field = "";
            _self.showCont();
        });

        $('#hwwxform-save').click(function () {
            _self.editSave();
        });

        $("#Sec_Cont").hide();
        $("#Head_Cont").hide();
        $("#Sec_Edit").show();
        $("#Head_Edit").show();
    },
    //隐藏编辑，显示内容
    showCont: function () {
        $("#Sec_Edit").hide();
        $("#Head_Edit").hide();
        $("#Sec_Cont").show();
        $("#Head_Cont").show();
    },
    //编辑保存
    editSave: function () {
        var _self = this;
        var _edit_Field = _self.options.Edit_Field; //当前编辑的字段ID
        var _page_ID = _self.options.Page_ID;
        var _pk_ID = _self.options.PK_ID;
        var _formData = _self.formData;
        var Allow_Null, Input_Type, Old_Value, Input_Title, Primary_Key;
        for (var i = 0; i < _formData.length; i++) {
            if (_formData[i].Field_ID == _edit_Field) {
                Allow_Null = parseInt(_formData[i].Allow_Null);
                Input_Type = parseInt(_formData[i].Input_Type);
                Old_Value = _formData[i].Field_Value;
                Input_Title = _formData[i].Input_Title;
                Primary_Key = parseInt(_formData[i].Primary_Key);
                break;
            }
        }

        //取值
        var _form_Value, _form_ShowValue;
        switch (Input_Type) {
            case 1: //文本框
                _form_Value = $("#Sec_Edit").find("textarea").val();
                _form_ShowValue = _form_Value;
                //空值处理
                if (Allow_Null == 0 && _form_Value == "") {
                    $.tips({ content: Input_Title + "不允许为空，请输入！", type: "warn" });
                    return;
                }
                break;
        }

        //没有变化
        if (_form_Value == Old_Value) {
            return;
        }

        _self.showCont();
    }
};

//获取Url参数
var getQueryString = function (name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
};
