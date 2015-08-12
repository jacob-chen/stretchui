/**
 * Created by user1 on 2015/8/12.
 */
//�༭��
function hwwxform(options) {
    var _self = this;
    _self.options = $.extend(_self.options, options);//˽�б���
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

                //���¼�
                $('.hwwxform-edit').click(function () {
                    var _fieldID = this.getAttribute("editdata");
                    _self.options.Edit_Field = _fieldID;
                    _self.showEdit(_fieldID);
                });
            }
        }, 'json');
    },
    //��ʾ�༭����
    showEdit: function (FieldID) {
        var _self = this;
        //ȡ��������
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
            case 1: //�ı���
                Form_Cont.push('<textarea placeholder="������' + Input_Title + '" class="ui-form-item-textarea" style="width: 100%;">' + Field_Value + '</textarea>');
                break;
        }
        Form_Cont.push('</div></li></ul>');
        $("#Sec_Edit").html(Form_Cont.join(''));

        Form_Cont = [];
        Form_Cont.push('<i class="ui-icon-return" id="hwwxform-cancel"></i>');
        Form_Cont.push('<h1>' + Input_Title + '</h1>');
        Form_Cont.push('<button class="ui-btn" id="hwwxform-save">����</button>');

        $("#Head_Edit").html(Form_Cont.join(''));

        //���¼�
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
    //���ر༭����ʾ����
    showCont: function () {
        $("#Sec_Edit").hide();
        $("#Head_Edit").hide();
        $("#Sec_Cont").show();
        $("#Head_Cont").show();
    },
    //�༭����
    editSave: function () {
        var _self = this;
        var _edit_Field = _self.options.Edit_Field; //��ǰ�༭���ֶ�ID
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

        //ȡֵ
        var _form_Value, _form_ShowValue;
        switch (Input_Type) {
            case 1: //�ı���
                _form_Value = $("#Sec_Edit").find("textarea").val();
                _form_ShowValue = _form_Value;
                //��ֵ����
                if (Allow_Null == 0 && _form_Value == "") {
                    $.tips({ content: Input_Title + "������Ϊ�գ������룡", type: "warn" });
                    return;
                }
                break;
        }

        //û�б仯
        if (_form_Value == Old_Value) {
            return;
        }

        _self.showCont();
    }
};

//��ȡUrl����
var getQueryString = function (name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
};