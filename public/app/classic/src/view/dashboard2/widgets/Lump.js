Ext.define('Admin.view.dashboard2.widgets.Lump', {
    extend: 'Ext.panel.Panel',
    xtype: 'lump',
    flex: 1,
    layout: 'fit',
    data: {
        title: '',
        value: '',
        imgSrc: '',
        progressColor: '',
        progress: '',
        top: ''
    },
    style: {
        'border-radius': '2px'
    },
    bodyStyle: {
        position: 'relative',
        'border-radius': '2px'
    },
    tpl:
    '<div style="width: 100%; height: 100%; color: #FFF;">' +
        '<div style="height: 60px; padding: 10px; position: absolute;">' +
            '<span style="display: block; height: 38px; line-height: 38px; font-size: 38px; margin-bottom:16px; font-weight: bold;">{value}</span>' +
            '<span style="display: block; height: 15px; line-height: 15px; font-size: 15px; margin-bottom:10px;">{title}</span>' +
        '</div>' +
        '<div style="float: right; opacity: 0.2; position: absolute;bottom: 30px; right: 10px;font-size: 30px;line-height: 100%;text-align: center;vertical-align: middle;">' +
            '<i class="fa {icon} fa-3x" style="color: #000; display: block; text-align: center;"></i>' +
        '</div>' +
        '<div style="height: 26px; width:100%; position:absolute; bottom:0; background: rgba(0,0,0,0.15);">' +
            '<span style="position: absolute; width:100%; display: inline-block; text-align: center; color: #fff; line-height: 26px;">{top}</span>' +
            '<div style="background: rgba(0,0,0,0.15); width: {progress}; height: 100%;"></div>' +
        '</div>' +
    '</div>'
});
