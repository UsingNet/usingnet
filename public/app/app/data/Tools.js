/**
 * Created by henry on 16-1-7.
 */
Ext.define('Admin.data.Tools', {
    singleton: true,
    CustomTools: {
        // 格式化日期时间
        formatTime: function (time, formatter) {
            var t = new Date(time);
            var tf = function (i) {
                return (i < 10 ? '0' : '') + i;
            };
            var format = formatter ? formatter : 'yyyy-MM-dd HH:mm:ss';
            return format.replace(/yyyy|MM|dd|HH|mm|ss/g, function (a) {
                switch (a) {
                    case 'yyyy':
                        return tf(t.getFullYear());
                        break;
                    case 'MM':
                        return tf(t.getMonth() + 1);
                        break;
                    case 'mm':
                        return tf(t.getMinutes());
                        break;
                    case 'dd':
                        return tf(t.getDate());
                        break;
                    case 'HH':
                        return tf(t.getHours());
                        break;
                    case 'ss':
                        return tf(t.getSeconds());
                        break;
                }
            });
        },
/*
        // 图片加载完成后重置聊天窗口的高度和移动滚动条
        resizeChatWin: function () {
            var chatWins = Ext.getCmp('chatWindow').items.items;
            // var imgs = [];
            Ext.Array.each(chatWins, function (chatWin) {
                var imgs = chatWin.body.dom.querySelectorAll('img');
                // imgs = imgs.concat(arr);
                for (var i = 0; i < imgs.length; i++) {
                    if (i !== imgs.length - 1) {
                        imgs[i].removeEventListener('load', this.imgLoadHandler);
                    }
                    imgs[i].addEventListener('load', this.imgLoadHandler);
                }
            });
            // 处理图片不能撑开的问题
            // var imgs = chatWin.body.dom.querySelectorAll('img');
        },
*/
        imgLoadHandler: function (e) {
            var chatWin = Ext.getCmp('chatWindow');
            this.setAttribute('height', this.height);
            chatWin.setHeight(chatWin.body.dom.scrollHeight);
            chatWin.body.dom.scrollTop = 99999;

        },
        // 通话计时器
        timeCounting: function (startTime) {
            var now = Date.parse(new Date());
            var second = (now - startTime) / 1000;

            var hourNum = parseInt(second / 3600);
            var hourStr = hourNum < 10 ? '0' + hourNum : hourNum;

            var minNum = parseInt(second % 3600 / 60);
            var minStr = minNum < 10 ? '0' + minNum : minNum;

            var secNum = parseInt(second % 3600 % 60);
            var secStr = secNum < 10 ? '0' + secNum : secNum;

            return '通话中: ' + hourStr + ':' + minStr + ':' + secStr;
        },

        // 时间转换
        timeTransform: function(second) {
            var hourNum = parseInt(second / 3600);
            var hourStr = hourNum < 10 ? '0' + hourNum : hourNum;

            var minNum = parseInt(second % 3600 / 60);
            var minStr = minNum < 10 ? '0' + minNum : minNum;

            var secNum = parseInt(second % 3600 % 60);
            var secStr = secNum < 10 ? '0' + secNum : secNum;

            return hourStr + '小时' + minStr + '分';
        }
    }
});