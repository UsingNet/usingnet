<!doctype html>
<html lang="zh-cmn-hans">
<head>
    <meta charset="UTF-8">
    <title>Document</title>
    <script src="http://app.cloopen.com/im50/ytx-web-im-min-new.js"></script>


</head>
<body>

<audio  src="" id="view">ss</audio>

<div id="call">呼叫</div>

<div id="cancel">取消</div>

<div id="answer">接听</div>

<script>
    var view = document.getElementById('view');
    window.onload = function ()
    {
        $.ajax({
            url: '/api/voip/token',
            success: function (res) {
                RL_YTX.init('aaf98f8951af2ba80151c2135efe4650');
                var login = new RL_YTX.LoginBuilder();
                login.setType(1);
                login.setUserName(res.username)
                login.setSig(res.sig);
                login.setTimestamp(res.date)

                RL_YTX.login(login, function (obj) {



                    var call = document.getElementById('call');
                    var cancel = document.getElementById('cancel');
                    var answer = document.getElementById('answer');

                    // 呼叫
                    call.onclick = function () {
                        var makeCallBuilder= new RL_YTX.MakeCallBuilder();
                        makeCallBuilder.setCalled('18682490537');
                        makeCallBuilder.setCallType(2); //呼叫的类型 0 音频 1视频 2 落地电话

                        RL_YTX.setCallView(view, null)//呼叫类型是0或者2的时候这么传
                        callId = RL_YTX.makeCall(makeCallBuilder,function(obj){
                            // success
                            console.log(obj)
                        }, function callback(obj){
                            // error
                            console.log(obj)
                        });
                    };


                }, function (obj) { // catch error
                    console.log('error' + obj.code)
                });
            }
        })


    }
</script>

</body>
</html>