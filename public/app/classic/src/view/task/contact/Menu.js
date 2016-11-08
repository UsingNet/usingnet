/**
 * Created by henry on 16-1-4.
 */
Ext.define('Admin.view.task.contact.Menu',{
    extend:'Ext.button.Split',
    xtype:'importmenu',
    autoDestroy: true,
    text: '导入',
    // handle a click on the button itself
    handler: function() {
        this.showMenu();
    },
    menu: {
        xtype:'menu',
        autoDestroy: true,
        items: [
            // these will render as dropdown menu items when the arrow is clicked:
            {text: '根据标签', handler: function(){
                var dialog = Ext.create('Admin.view.task.contact.ByTags');
                var menu = this.up('importmenu');
                dialog.show();
                dialog.addListener('close', function(){
                    menu.data = this.data;
                    //console.log(this.data);
                    menu.fireEvent('change');
                    dialog.destroy();
                });
            }},
            {text: '上传文件', handler: function(){
                var dialog = Ext.create('Admin.view.task.contact.ByFile');
                var menu = this.up('importmenu');
                dialog.show();
                dialog.addListener('close', function(){
                    menu.data = this.data;
                    menu.fireEvent('change');
                    dialog.destroy();
                });
            }},
            {text: '用户信息', handler: function(){
                var dialog = Ext.create('Admin.view.task.contact.ByInfo');
                var menu = this.up('importmenu');
                dialog.show();
                dialog.addListener('close', function(){
                    menu.data = this.data;
                    menu.fireEvent('change');
                    dialog.destroy();
                });
            }}
        ]
    }
});