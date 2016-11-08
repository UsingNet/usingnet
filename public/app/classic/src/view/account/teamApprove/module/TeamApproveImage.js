Ext.define('Admin.view.account.teamApprove.module.TeamApproveImage', {
    extend: 'Ext.Img',
    xtype: 'teamapproveimage',
    width: 400,
    height: 200,
    // hidden: true,
    style: {
        border: '1px solid #CFCFCF',
        padding: '1px',
        borderRadius: '4px'
    },
    margin: '0 0 10 105',
    listeners: {
        load: {
            element: 'el',
            fn: function() {
                var image = this.component;
                image.up('teamapprove').controller.imageLoad(image);
            }
        }
    }
});
