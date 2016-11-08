module.exports = {
    get: {
        contact: '/contact',
        stats: {
            agent: '/stats/agent',
        },
        voip: {
            token: '/voip/token',
            onwork: '/voip/agentonwork',
            onready: '/voip/agentready',
        },
        setting: {
            base: '/setting/base',
            web: '/setting/web',
            wechat: '/setting/wechat',
            voip: '/setting/voip',
            weibo: '/setting/weibo',
        },
        message: {
            agent: '/message/agent',
        },
        me: '/me',
        order: {
            read: '/order',
            category: '/order/category',
        },
        member: '/member',
    },
    post: {
        me: '/me',
        contact: '/contact',
        setting: {
            web: '/setting/web',
            weibo: '/setting/weibo',
            voip: '/setting/voip',
        },
        member: '/member',
    },
    put: {
        setting: {
            web: '/setting/web/:id',
            wechat: '/setting/wechat/:id',
            weibo: '/setting/weibo/:id',
        },
        contact: '/contact/:id',
        member: '/member/:id',
    },
    delete: {
        member: '/member/:id',
        contact: '/contact/:id',
        setting: {
            web: '/setting/web/:id',
            wechat: '/setting/wechat/:id',
            weibo: '/setting/weibo/:id',
        },
    },
};
