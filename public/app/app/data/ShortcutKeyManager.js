/**
 * Created by jhli on 16-3-10.
 */

Ext.define('Admin.data.ShortcutKeyManager', {
    extend: 'Ext.data.AbstractStore',
    singleton: true,
    constructor: function() {
        var me = this;
        me.callParent(arguments);
        var numberKeyCodeMap = {
            49: 1,
            50: 2,
            51: 3,
            52: 4,
            53: 5,
            54: 6,
            55: 7,
            56: 8,
            57: 9,
            48: 10

        };

        document.onkeyup = function(e) {
            if (e.ctrlKey && e.shiftKey && numberKeyCodeMap.hasOwnProperty(e.keyCode)) {
                me.fireEvent('ctrlShiftNumPress', {number: numberKeyCodeMap[e.keyCode]});
            }
        };
    }

});

