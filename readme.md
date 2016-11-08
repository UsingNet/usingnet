### Usingnet


#### 工单
/api/order

* POST      /       增    sample {from: '', to: ''}
* PUT       /_id    改
* GET       /_id    单个
* GET       /       列表

其中：
* type: 客户主动发起，FEEDBACK； 客服主动发起：VISIT
* title: 3~64字符
* participants: 参与者_id，至少2人


#### 任务
/api/task

* POST      /       增    sample {"type":"MAIL","title":"Hello World", "assigners":[1,2,3], "receivers":[2,3,4,5,6,7,8,9], "media":{"type":"article", "id":1}}
* PUT       /_id    改
* DELETE    /_id    删
* GET       /_id    单个
* GET       /       列表

其中：
* type: 邮件，MAIL； 短信：SMS； 录音电话：VOIP_RECORD； 客服电话：VOIP_STAFF
* title: 3~64字符
* assigners: 被分配人ID
* receivers: 客户ID
* media: 为任务资料， 当Type是人工类型时，任务资料供员工参考，若是自动任务，任务资料直接发送给客户。任务资料类型可为article, voice, message

#### 媒体
文章 /api/media/article

* POST      /       增    sample {"title": "标题", "content": "文章内容"}
* PUT       /_id    改
* DELETE    /_id    删
* GET       /_id    单个
* GET       /       列表

短信 /api/media/sms

* POST      /       增    sample {"title": "标题", "content": "短信内容【优信】"}
* PUT       /_id    改
* DELETE    /_id    删
* GET       /_id    单个
* GET       /       列表

语音 /api/media/voice

* POST      /       增    sample {"title": "标题", "url": "http://app.usingnet.net/attachments/voice/5545464551.wav"}
* PUT       /_id    改
* DELETE    /_id    删
* GET       /_id    单个
* GET       /       列表

上传语音 /api/upload?type=voice

#### 消息

先从服务器获取 Token, 使用 Token 链接 WebSocket 服务器监听消息 

获取 token GET /api/message/create    sample {"type": "im", "from": "service@usingnet.com", "to": "easthing@gmail.com"} 

发送消息 POST /api/message            sample {"type": "MAIL|SMS|VOICE|IM", "from": "邮箱|号码|团队ID|联系人ID|生成访客ID", "to": "同 from", "body": "消息内容"}


