/**
 * Created by henry on 16-2-22.
 */
define([],function(){
    var windowVersion = {
        '5.0': '2000',
        '5.1': 'XP',
        '6.0': 'Vista',
        '6.1': '7',
        '6.2': '8',
        '6.3': '8.1',
        '6.4': '10',
        '10.0': '10'
    };
    var Service = {};

    Service.parse = function(user_agent) {
        if (!user_agent) {
            user_agent = '';
        }

        var os = 'Unknown';
        var match = null;
        if (user_agent.indexOf('Linux') > -1) {
            os = 'Linux';
        } else if (user_agent.indexOf('Windows') > -1) {
            os = 'Windows';
            match = user_agent.match(/Windows NT (\d+\.\d+)/);
            if (match && match[1] && windowVersion[match[1]]) {
                os += ' '+windowVersion[match[1]];
            }
        } else if (user_agent.indexOf('Mac OS') > -1) {
            os = 'Mac OS';
            match = user_agent.match(/Mac OS[\w\.\s_]+]/);
            if (match) {
                os = match[0].replace(/_/g, '.');
            }
        }

        var browserFamily = 'Unknown';
        var brosserVersion = '';

        if (user_agent.indexOf('Opera') > -1) {
            browserFamily = 'Opera';
        } else if (user_agent.indexOf('Chrome') > -1) {
            browserFamily = 'Chrome';
        } else if (user_agent.indexOf('Firefox') > -1) {
            browserFamily = 'Firefox';
        } else if (user_agent.indexOf('Safari') > -1) {
            browserFamily = 'Safari';
        } else if (user_agent.indexOf('MSIE') > -1) {
            browserFamily = 'Internet Explorer';
            match = user_agent.match(new RegExp(browserFamily + ' ([\\d\\.]+)'));
            if (match && match[1]) {
                brosserVersion = match[1];
            }
        } else if (user_agent.indexOf('Trident')) {
            browserFamily = 'Internet Explorer';
            match = user_agent.match(new RegExp('rv\:([\\d\\.]+)'));
            if (match && match[1]) {
                brosserVersion = match[1];
            }
        }


        if (['Chrome', 'Firefox', 'Opera', 'Safari'].indexOf(browserFamily) > -1) {
            match = user_agent.match(new RegExp(browserFamily + '\/([\\d\\.]+)'));
            if (match && match[1]) {
                brosserVersion = match[1];
            }
        }


        return {
            os: os,
            browser: {
                name: browserFamily + ' ' + brosserVersion,
                family: browserFamily,
                version: brosserVersion
            }
        };
    };

    return Service;

});