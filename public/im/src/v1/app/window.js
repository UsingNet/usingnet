/**
 * Created by henry on 15-12-9.
 */
define(['module/dialog_im', 'module/dialog_lm', 'module/serviceGroup', 'module/dialog_loading', 'lib/location', 'lib/ajax', 'module/header', 'module/order'], function(ImDialog, LmDialog, ServiceGroup, loadingDialog, Location, Ajax, Header, Order) {
    return function() {
        if (Location.search('track_id') && Location.search('tid')) {
            var dialog = null;
            // var loading = new loadingDialog();
            // loading.appendTo(document.body);

            Ajax.get('/api/teaminfo/' + Location.search('tid'), { track_id:Location.search('track_id'), user_info:Location.search('user_info'), _: Math.random() }, function(response) {
                var header = new Header(response.data);
                var team_info = response.data;
                header.appendTo(document.body);


                if (response.data.web.type == 'ORDER' && !response.data.current_order) {
                    dialog = new Order(Location.search('tid'), Location.search('track_id'), Location.search('page_id'), Location.search('user_info'), response.data);
                } else {
                    if (response.data.online) {
                        dialog = new ImDialog(Location.search('track_id'), Location.search('tid'), Location.search('user_info'), team_info, Location.search('page_id'), response.data.web);
                        // dialog.setTitle(response.data.name);
                        // dialog.setLogo(response.data.logo);

                        if (team_info.web.display_agent_group) {
                            var serviceGroup = new ServiceGroup(team_info);
                            serviceGroup.appendTo(document.body);
                        }
                    } else {
                        dialog = new LmDialog(Location.search('track_id'), Location.search('tid'), Location.search('user_info'), team_info, Location.search('page_id'), response.data.web);
                    }
                }

                // loading.removeFrom(document.body);
                dialog.appendTo(document.body);
            });
            //Ajax.get('/api/online/'+Location.search('tid'),{},function(response){});
        } else {
            document.write("错误, track_id, tid 为空");
        }
    };
});
