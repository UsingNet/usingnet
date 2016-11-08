
<div style="width: 100%; background: #f3f3f3; font-size: 16px; color: #555; margin-top: 30px; padding: 10px;">
	<div style="width: 600px; margin: 0 auto; background: #fff; position: relative; padding: 10px; border-bottom: 3px solid #7EBDD4;">

        <i class="using-logo"><i class="_uli"><i class="_uli-g"></i><i class="_uli-u"></i><i class="_uli-l"></i><i class="_uli-r"></i></i></i>
        <style>
            .using-logo *{display: block;position: absolute;}
            .using-logo {display: block;background: rgb(217, 234, 244);height: 9.1em;width: 8.4em;border-radius: .2em .2em 3.7em 3.7em;padding-top:.7em;position: relative;margin: 0 auto;}
            .using-logo ._uli{background: rgb(141, 204, 228); height: 8.4em; width: 7.1em; border-radius: .1em .1em 3.4em 3.4em; margin: 0 0 0 .6em;overflow: hidden;}
            .using-logo ._uli-g{right:0;bottom:0;width: 0;height: 0;border-bottom: 8.3em solid rgb(115, 192, 222);border-left: 6.8em solid transparent;}
            .using-logo ._uli-u{height: 3.9em;  width: 1.8em;  border-radius: 0 0 2.5em 2.5em;  margin: 1.8em 0 0 1.0em;  border-left: 1.7em solid rgb(210, 232, 244);  border-right: 1.7em solid rgb(210, 232, 244);  border-bottom: 1.5em solid rgb(210, 232, 244);  }
            .using-logo ._uli-l{height: .7em;  width: 1.7em;  background: rgb(210, 232, 244);  border-radius: .1em .8em 0 0;  margin: 1.1em 0 0 1em;}
            .using-logo ._uli-r{height: .7em;width: 1.7em;background: rgb(210, 232, 244);border-radius: .8em .1em 0 0;margin: 1.1em 0 0 4.5em;}
        </style>
        <span style="display: block; margin: 10px auto; text-align: center; font-size: 60px; font-weight: 900; color: #7EBDD4;">Usingnet</span>
		<p style="text-align: center; color: #666666; margin: 40px 15px;">您好，{{ $team }}。感谢您注册{{ Config::get('app.name') }}，请点击下面的按钮激活您的账号。</p>
		<a href="{{ $url }}" style="display: block; margin: 0 auto; width: 100px; text-decoration: none; padding: 10px; background: #1F7FB2; border-radius: 5px; color: #fff; text-align: center;">激活您的账号</a>
		<p style="font-size: 14px; color: #999; margin: 10px 30px; word-break: break-all;">如果上面的按钮不能点击，您可以复制以下链接到浏览器地址栏访问以激活您的账号：&nbsp;{{ $url }}</p>
		<p style="text-align: center; margin: 40px 20px; color: #999999;">如果您没有注册优信，请忽略此邮件。如果您有任何疑问或顾虑，请到<a href="{{ Config::get('app.website') }}" style="color: #71ADD8; text-decoration: none;">优信官网</a>联系我们。</p>
	</div>
</div>


<!--
<div style="width: 100%; background: #f3f3f3;font-size:16px;color: #555; margin-top: 30px;padding: 10px;">
    <div style="width: 500px;margin: 0 auto;background: #FFF; position: relative;padding: 10px;">
        <div style="padding: 10px 0; font-size: 20px;border-bottom: 1px solid #ddd">
            {{ Config::get('app.name')  }}
        </div>
        <div style="margin-top: 30px;">
            <p>
                您好，{{ $team }}
            </p>
            <p style="margin-bottom: 20px;;">
                感谢您注册{{ Config::get('app.name') }}，点击下面链接激活您的账号
            </p>
            <p>
                <a style="text-decoration: none;color: #29c0d4" href="{{ $url  }}">{{ $url }}</a>
            </p>
            <p style="color: #888;font-size: 12px;">
                如果您没有注册过优信，请忽略此邮件
            </p>
        </div>
        <div style="font-size: 12px; color: #666; text-align: center; border-top: 1px solid #ddd;padding: 10px 0;margin-top: 50px;">
            如有疑问，请到<a style="color: #29c0d4; text-decoration: none;" href="{{ Config::get('app.website') }}">优信官网</a>联系我们
        </div>
    </div>
</div>
-->




