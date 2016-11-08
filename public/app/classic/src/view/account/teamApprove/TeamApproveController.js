Ext.define('Admin.view.account.teamApprove.TeamApproveController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.teamapprove',
    init: function() {},
    beforerender: function(panel) {
        var me = this;
        if (Admin.data.Identity.error) {
            Ext.Msg.alert('错误', Admin.data.Identity.error);
        } else if (Admin.data.Identity.store) {
            me.statusHandler(panel, Admin.data.Identity.store);
        }

    },
    statusHandler: function(panel, data) {
        var
        text = panel.down('#statusText'),
        submitBtn = panel.down('#submitBtn'),
        readonlyform = panel.down('readonlyform'),
        editableform = panel.down('editableform');
        switch (data.status) {
            case 'INIT': case 'FAIL':
                readonlyform.hide();
                editableform.show();
                break;
            case 'SUCCESS': case 'CHECKING':
                readonlyform.show();
                editableform.hide();
                break;
        }
        switch (data.status) {
            case 'INIT':
                submitBtn.show();
                break;
            case 'FAIL':
                submitBtn.show();
                text.show();
                text.setText('审核不通过，请修改认证信息后重新提交！');
                text.setStyle('color', 'red');
                break;
            case 'SUCCESS':
                submitBtn.hide();
                text.show();
                text.setText('审核通过！');
                text.setStyle('color', 'green');
                break;
            case 'CHECKING':
                submitBtn.hide();
                text.show();
                text.setText('正在审核，请耐心等待。');
                text.setStyle('color', 'green');
                break;
        }
        panel.down('editableform').getForm().setValues(data);
        panel.down('readonlyform').getForm().setValues(data);
    },
    uploadImage: function(filefield) {
        var form = filefield.up('form');
        form.submit({
            url: '/api/upload/certificate',
            waitMsg: '正在上传...',
            success: function(fp, o) {
                var src = o.result.data;
                form.next().setSrc(src);
                form.prev().setValue(src);
            },
            failure: function(fp, o) {
                Ext.Msg.alter('错误', '服务器错误！');
            }
        });
    },
    imageLoad: function(image) {
        if (image.src) {
            image.show();
            image.setHeight(200);
            image.setWidth(400);
        }
    },
    dispalyFieldImgChange: function(field, newValue) {
        field.next('teamapproveimage').setSrc(newValue);
    }
});

