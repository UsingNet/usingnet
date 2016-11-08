Ext.define('Admin.view.pages.ErrorLoginOtherPlaceWindow', {
    extend: 'Admin.view.pages.ErrorLoginTimeoutWindow',
    xtype: 'loginotherplacepage',
    title: '账号在别处登录',
    requires: [
        'Admin.view.authentication.AuthenticationController',
        'Ext.container.Container',
        'Ext.form.Label',
        'Ext.layout.container.VBox',
        'Ext.toolbar.Spacer'
    ],
    cls:'login-other-place-inner-container'
});
