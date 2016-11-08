/**
 * Created by henry on 15-12-21.
 */
Ext.define('Admin.store.SystemNotices', {
    extend: 'Ext.data.Store',
    alias: 'store.notices',
    model: 'Admin.model.Message',
    storeId: 'noticeStore',
    /*data:[
     {created_at:1450695208, body:'Hello World', "package":{"read":true}},
     {created_at:1450695217, body:'Hello World 2', "package":{"read":false}}
     ],*/
    sync: function () {
        var toUpdate = this.getUpdatedRecords();
        var self = this;
        if (toUpdate.length > 0) {
            if (this.fireEvent('beforesync', {}) !== false) {
                Ext.Array.each(toUpdate, function (item) {
                    self.connector.send({action: 'read', _id: item.data._id});
                });
            }
        }

        return this;
    },
    load: function () {
        this.init(function (self) {
            self.connector.send({action: 'tail'});
            self.isSyncing = true;
        });
    },
    autoLoad: true,
    init: function (callback) {
        var self = this;
        if (!self.sendList) {
            self.sendList = [];
        }

        if (self.connector && self.connector.connected) {
            if (callback) {
                callback(self);
            }
            return;
        }

        if (callback) {
            self.sendList.push(callback);
        }


        if (self.connecting) {
            return;
        }
        self.connecting = true;
        self.reconnectCount = 0;

        //connectWebsocket();

        //function connectWebsocket() {
        self.reconnectCount++;
        Ext.Ajax.request({
            url: '/api/message/agent',
            method: 'GET',
            params: {
                type: 'IM',
                remote: 'SYSTEM'
            },
            success: function (response) {
                var obj = Ext.decode(response.responseText);
                var token = obj['data'];
                self.connector = Ext.create('Admin.store.communication.customerService.WebSocket', {
                    token: token
                    //,reconnectByToken: function() {
                    //    setTimeout(function() {
                    //        connectWebsocket();
                    //    }, Math.pow(2, self.reconnectCount) * 1000);
                    //}
                });

                self.connector.addListener('tokenerror', function(event){
                    Ext.Ajax.request({
                        url: '/api/message/agent',
                        method: 'GET',
                        params: {
                            type: 'IM',
                            remote: 'SYSTEM'
                        },
                        success: function (response) {
                            var obj = Ext.decode(response.responseText);
                            event.target.token = obj['data'];
                        }
                    });
                });

                self.connector.addListener('message', function (event) {
                    switch (event.response.type) {
                        case 'event':
                            switch (event.response.data.action) {
                                case 'online':
                                    self.connecting = false;
                                    self.connector.connected = true;
                                    Ext.Array.each(self.sendList, function (callback) {
                                        if (typeof(callback) == 'function') {
                                            callback(self);
                                        }
                                    });
                                    //self.load();
                                    break;
                                case 'tail':
                                    Ext.Array.each(event.response.data.messages, function (message) {
                                        var index = self.findExact('_id', message['_id']);
                                        if (index < 0) {
                                            self.insert(0, message);
                                        } else {
                                            self.removeAt(index);
                                            self.insert(index, message);
                                        }
                                    });
                                    Ext.Array.each(self.getDataSource().items, function (item) {
                                        item.phantom = false;
                                    });
                                    self.fireEvent('load', {});
                                    break;
                                case 'read':
                                    self.load();
                                    break;
                                default:
                                    console.log(event.response.data.action);
                            }
                            break;
                        case 'message':
                            self.insert(0, event.response.data);
                            self.getAt(0).phantom = false;
                            self.fireEvent('load', {});
                            break;
                    }
                });
            }
        });
        //}

    },
    getUnreadNotices: function () {
        var ret = [];
        Ext.Array.each(this.getDataSource().items, function (item) {
            if (!item['data']['package'] || !item['data']['package']['read']) {
                ret.push(item);
            }
        });
        return ret;
    },
    getCount: function () {
        return this.getTotalCount();
    },
    getTotalCount: function () {
        return this.getDataSource().items.length;
    }
});
