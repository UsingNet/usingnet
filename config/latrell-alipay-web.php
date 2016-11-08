<?php
return [

	// 安全检验码，以数字和字母组成的32位字符。
	'key' => env('ALIPAY_KEY'),
	//签名方式
	'sign_type' => env('ALIPAY_SIGN_TYPE'),

	// 服务器异步通知页面路径。
	'notify_url' => env('ALIPAY_NOTICE_URL'),

	// 页面跳转同步通知页面路径。
	'return_url' =>  env('ALIPAY_RETURN_URL')
];
