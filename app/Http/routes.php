<?php

/**
 * Auth Routes
 */
Route::group(['domain' => \Config::get('auth.domain'), 'namespace' => 'Auth'], function () {
    Route::group(['middleware' => ['guest']], function () {
        Route::get('login', 'AuthController@getLogin');
        Route::post('login', 'AuthController@postLogin');
        Route::get('register', 'AuthController@getRegister');
        Route::post('register', 'AuthController@postRegister');
        Route::get('activation', 'AuthController@getActivation');
        Route::get('geetest', 'AuthController@getGeetest');
        Route::post('activation', 'AuthController@postActivation');
        Route::post('veritication', 'AuthController@postVeritication');
        Route::post('sendsms', 'AuthController@postSendsms');
        Route::get('reset', 'PasswordController@getReset');
        Route::post('reset', 'PasswordController@postReset');
        Route::post('send', 'PasswordController@postSend');
    });

    Route::get('logout', 'AuthController@getLogout');
    Route::get('/', function () {
        return redirect('login');
    });
});

// 插件
Route::group(['prefix' => 'appstore', 'namespace' => 'Api\Appstore'], function() {
    Route::get('all', 'MainController@getAll');
    Route::get('logout', 'MainController@getLogout');
    Route::controller('order', 'OrderController');
    Route::controller('vote', 'VoteController');
    Route::controller('tryout', 'TryoutController');
    Route::controller('turntable', 'TurntableController');
    Route::get('photo/admin/{id}', 'PhotoController@getAdminshow');
    Route::get('photo/admin', 'PhotoController@getAdmin');
    Route::post('photo/admin', 'PhotoController@postAdmin');
    Route::get('photo/{appId}', 'PhotoController@getIndex');
    Route::controller('photo', 'PhotoController');

    Route::get('pay/{appid}', function($appid) {
        return redirect(asset('/appstore/wepay/' . $appid));
    });

    // 优信跳转到莫策云
    Route::get('wepay/wx1aa48f38c65fbc82', function() {
        return redirect(asset('/appstore/wepay/wxb9f2858dd896b0e3'));
    });

    // 微信支付
    Route::get('wepay/admin', 'WepayController@getAdmin');
    Route::post('wepay/admin', 'WepayController@postAdmin');
    Route::get('wepay/admin/{id}', 'WepayController@getAdminshow');
    Route::get('wepay/{id}', 'WepayController@getIndex');
    Route::controller('wepay', 'WepayController');

    Route::get('alipay/admin', 'AlipayController@getAdmin');
    Route::post('alipay/admin', 'AlipayController@postAdmin');
    Route::get('alipay/admin/{id}', 'AlipayController@getAdminshow');
    Route::get('alipay/{id}', 'AlipayController@getIndex');
    Route::controller('alipay', 'AlipayController');

    // 团购
    Route::get('groupbuy/admin', 'GroupbuyController@getAdmin');
    Route::post('groupbuy/admin', 'GroupbuyController@postAdmin');
    Route::get('groupbuy/admin/{id}', 'GroupbuyController@getAdminshow');
    Route::get('groupbuy/{id}', 'GroupbuyController@getIndex');
    Route::controller('groupbuy', 'GroupbuyController');
});


/**
 * Api Routes
 */
Route::group(['namespace' => 'Api', 'prefix' => 'api'], function () {

    // 微信插件
    Route::controller('wepay', 'WepayController');

    // 支付回调
    Route::controller('paycallback', 'PaycallbackController');

    // 中奖用户
    Route::get('winning/{token}', 'WinningController@getShow');
    Route::post('winning/{token}', 'WinningController@postSubmit');

    // 在线客服统计
    Route::resource('online', 'OnlineController');

    // 邮件
    Route::controller('mail', 'MailController');

    // 开放数据
    Route::controller('open', 'OpenController');
    Route::controller('proxy', 'ProxyController');

    // 云通讯回调
    Route::controller('voip/callback', 'Voip\CallbackController');
    Route::resource('knowledge/category', 'Knowledge\CategoryController');
    Route::resource('knowledge', 'Knowledge\KnowledgeController');
    Route::controller('send', 'SendController');
    Route::controller('account/pay', 'Account\PayController');

    // 微信
    Route::group(['prefix' => 'wechat', 'namespace' => 'Wechat'], function () {
        Route::controller('manage', 'ManageController');
        Route::controller('qrcode', 'QrcodeController');
        Route::controller('auth', 'AuthController');
        Route::controller('notice', 'NoticeController');
        Route::any('callback/{appid?}', 'CallbackController@anyCallback');
        Route::controller('customer', 'CustomerController');
    });

    // 微博
    Route::controller('weibo', 'WeiboController');
    // 客服评价
    Route::resource('evaluation', 'EvaluationController');

    // 插件
    Route::controller('plugin', 'PluginController');


    // 短信
    Route::controller('sms', 'SmsController');

    Route::group(['middleware' => 'auth'], function () {

        Route::controller('qrcode', 'QrcodeController');
        Route::controller('customer', 'CustomerController');
        Route::resource('notice', 'NoticeController');
        Route::resource('appstore', 'AppstoreController');
        // 权限管理
        Route::resource('permission', 'PermissionController');
        Route::controller('visitor', 'VisitorController');
        Route::controller('voip', 'Voip\VoipController');


        Route::post('group/operator', 'GroupController@postOperator');
        Route::resource('group', 'GroupController');
        // 代理
        // 用户离线
        Route::post('user/offline', 'UserController@postOffline');
        // 手机验证码
        Route::controller('veritication', 'VeriticationController');

        // 所有者接口
        Route::group(['prefix' => 'account', 'namespace' => 'Account'], function () {
            Route::resource('identity', 'IdentityController');
            Route::resource('bill', 'BillController');
            Route::get('plan/balance', 'PlanController@getBalance');
            Route::resource('plan', 'PlanController');
            Route::get('certificate/{path}', 'CertificateController@getIndex');
        });

        Route::resource('setting/quick-reply', 'Setting\QuickreplyController');
        Route::resource('setting/phrase', 'Setting\PhraseController');
        Route::resource('task', 'TaskController');
        Route::resource('member', 'MemberController');
        Route::group(['prefix' => 'setting', 'namespace' => 'Setting'], function () {
            Route::resource('auto-reply', 'AutoreplyController');
            Route::resource('assign', 'AssignController');
            Route::post('mail/testimap', 'MailController@postTestimap');
            Route::resource('mail', 'MailController');
            Route::resource('web', 'WebController');
            Route::resource('weibo', 'WeiboController');
            Route::get('/wechat/menu/{id}', 'WechatController@getMenu');
            Route::post('/wechat/menu/{id}', 'WechatController@postMenu');
            Route::resource('wechat', 'WechatController');
            Route::resource('sms', 'SmsController');
            Route::resource('voip', 'VoipController');
            Route::resource('worktime', 'WorktimeController');
            Route::resource('holiday', 'HolidayController');
            Route::resource('plugin', 'PluginController');
            Route::resource('notice', 'NoticeController');
            Route::resource('order', 'OrderController');
            Route::controller('support', 'SupportController');
        });

        Route::controller('setting', 'Setting\BaseController');
        Route::post('/member/extend', 'MemberController@postExtend');
        Route::resource('tag', 'TagController');
        Route::post('contact/import', 'ContactController@postImport');
        Route::resource('contact', 'ContactController');
        Route::resource('media/article', 'Media\ArticleController');
        Route::resource('media/sms', 'Media\SmsController');
        Route::resource('media/voice', 'Media\VoiceController');
        Route::controller('team', 'TeamController');
        Route::resource('tasklist', 'TasklistController');

        Route::post('order/launch', 'OrderController@postLaunch');
        Route::post('order/shift', 'OrderController@postShift');
        Route::post('order/restore', 'OrderController@postRestore');
        Route::get('order/category', 'OrderController@getCategory');
        Route::get('order/history', 'OrderController@getHistory');
        Route::get('order/timing', 'OrderController@getTiming');
        Route::post('order/timing', 'OrderController@postTiming');
        Route::resource('order', 'OrderController');
        Route::controller('system', 'SystemController');
        Route::post('me', 'UserController@postMe');
        Route::get('user/customer', 'UserController@getCustomer');
        Route::controller('stats', 'StatsController');
        Route::controller('log', 'LogController');
        Route::resource('customlog', 'CustomlogController');
        Route::controller('dashboard', 'DashboardController');
        Route::resource('track', 'TrackController');
        Route::controller('online', 'OnlineController');
    });

    Route::group(['prefix' => 'message', 'namespace' => 'Message'], function () {
        Route::controller('agent', 'AgentController');
        Route::controller('client', 'ClientController');
        Route::controller('/', 'MessageController');
    });

    Route::get('/teaminfo/{token}', 'TeamController@getTeaminfo');
    // 上传文件
    Route::controller('upload', 'UploadController');

    // 用户资料
    Route::get('me', 'UserController@getMe');
    Route::get('user/callback', 'UserController@getCallback');
    Route::post('user/callback', 'UserController@postCallback');
    // 客服头像
    Route::get('/user/avatar/{token}', 'UserController@getAvatar');
    Route::post('/unlock', 'UserController@postUnlock');

    Route::get('/', function () {
        return ['code' => 404, 'msg' => 'The request not found'];
    });
});



/**
 * Api v2 Routes
 */
Route::group(['namespace' => 'V2', 'prefix' => 'v2'], function () {
    // 支付回调
    Route::controller('paycallback', 'PaycallbackController');
    // 访客
    Route::controller('client', 'ClientController');
    // 中奖用户
    Route::get('winning/{token}', 'WinningController@getShow');
    Route::post('winning/{token}', 'WinningController@postSubmit');
    // 在线客服统计
    Route::resource('online', 'OnlineController');
    // 短信
    Route::controller('sms', 'SmsController');
    // 邮件
    Route::controller('mail', 'MailController');
    // 开放数据
    Route::controller('open', 'OpenController');
    Route::controller('proxy', 'ProxyController');
    // 云通讯回调
    Route::controller('voip/callback', 'Voip\CallbackController');
    Route::controller('send', 'SendController');

    // 微信
    Route::group(['prefix' => 'wechat', 'namespace' => 'Wechat'], function () {
        Route::controller('manage', 'ManageController');
        Route::controller('qrcode', 'QrcodeController');
        Route::controller('auth', 'AuthController');
        Route::controller('notice', 'NoticeController');
        Route::any('callback/{appid?}', 'CallbackController@anyCallback');
        Route::controller('customer', 'CustomerController');
    });
    // 微博
    Route::controller('weibo', 'WeiboController');
    // 客服评价
    Route::resource('evaluation', 'EvaluationController');
    // 插件
    Route::controller('plugin', 'PluginController');
    Route::group(['middleware' => 'auth'], function () {
        // 坐席
        Route::controller('agent', 'AgentController');
        Route::controller('qrcode', 'QrcodeController');
        Route::controller('customer', 'CustomerController');
        Route::resource('notice', 'NoticeController');
        Route::resource('appstore', 'AppstoreController');

        // 权限管理
        Route::resource('permission', 'PermissionController');
        Route::controller('voip', 'Voip\VoipController');
        Route::post('group/operator', 'GroupController@postOperator');
        Route::resource('group', 'GroupController');

        // 代理
        // 用户离线
        Route::post('user/offline', 'UserController@postOffline');
        // 手机验证码
        Route::controller('veritication', 'VeriticationController');

        // 所有者接口
        Route::group(['prefix' => 'account', 'namespace' => 'Account'], function () {
            Route::resource('bill', 'BillController');
            Route::get('plan/balance', 'PlanController@getBalance');
            Route::resource('plan', 'PlanController');
            Route::resource('pay', 'PayController');
        });

        Route::resource('setting/quick-reply', 'Setting\QuickreplyController');
        Route::resource('setting/phrase', 'Setting\PhraseController');
        Route::resource('task', 'TaskController');
        Route::resource('member', 'MemberController');
        Route::group(['prefix' => 'setting', 'namespace' => 'Setting'], function () {
            Route::resource('auto-reply', 'AutoreplyController');
            Route::resource('assign', 'AssignController');
            Route::post('mail/testimap', 'MailController@postTestimap');
            Route::resource('mail', 'MailController');
            Route::resource('web', 'WebController');
            Route::resource('weibo', 'WeiboController');
            Route::get('/wechat/menu/{id}', 'WechatController@getMenu');
            Route::post('/wechat/menu/{id}', 'WechatController@postMenu');
            Route::resource('wechat', 'WechatController');
            Route::resource('sms', 'SmsController');
            Route::resource('voip', 'VoipController');
            Route::resource('worktime', 'WorktimeController');
            Route::resource('holiday', 'HolidayController');
            Route::resource('plugin', 'PluginController');
            Route::resource('notice', 'NoticeController');
            Route::resource('order', 'OrderController');
            Route::controller('support', 'SupportController');
        });

        Route::controller('setting', 'Setting\BaseController');
        Route::post('/member/extend', 'MemberController@postExtend');
        Route::resource('tag', 'TagController');
        Route::post('contact/import', 'ContactController@postImport');
        Route::resource('contact', 'ContactController');
        Route::resource('media/article', 'Media\ArticleController');
        Route::resource('media/sms', 'Media\SmsController');
        Route::resource('media/voice', 'Media\VoiceController');
        Route::controller('team', 'TeamController');
        Route::resource('tasklist', 'TasklistController');

        Route::post('order/launch', 'OrderController@postLaunch');
        Route::post('order/shift', 'OrderController@postShift');
        Route::post('order/restore', 'OrderController@postRestore');
        Route::get('order/category', 'OrderController@getCategory');
        Route::get('order/history', 'OrderController@getHistory');
        Route::get('order/timing', 'OrderController@getTiming');
        Route::post('order/timing', 'OrderController@postTiming');
        Route::resource('order', 'OrderController');
        Route::controller('system', 'SystemController');
        Route::post('me', 'UserController@postMe');
        Route::get('user/customer', 'UserController@getCustomer');
        Route::controller('stats', 'StatsController');
        Route::controller('log', 'LogController');
        Route::resource('customlog', 'CustomlogController');
        Route::controller('dashboard', 'DashboardController');
        Route::resource('track', 'TrackController');
    });


    Route::group(['prefix' => 'message', 'namespace' => 'Message'], function () {
        Route::controller('agent', 'AgentController');
        Route::controller('client', 'ClientController');
        Route::controller('/', 'MessageController');
    });

    Route::get('/teaminfo/{token}', 'TeamController@getTeaminfo');
    // 上传文件
    Route::controller('upload', 'UploadController');

    // 用户资料
    Route::get('me', 'UserController@getMe');
    Route::get('user/callback', 'UserController@getCallback');
    Route::post('user/callback', 'UserController@postCallback');
    // 客服头像
    Route::get('/user/avatar/{token}', 'UserController@getAvatar');
    Route::post('/unlock', 'UserController@postUnlock');

    Route::get('/', function () {
        return ['code' => 404, 'msg' => 'The request not found'];
    });
});


Route::group(['namespace' => 'Developer', 'domain' => \Config::get('developer.domain')], function() {
    Route::any('/', function() {
        echo 'welcome to UsingNet developer area';
    });

    Route::get('error/{id}', 'ErrorController@getShow');
    Route::controller('wechat', 'WechatController');
});



