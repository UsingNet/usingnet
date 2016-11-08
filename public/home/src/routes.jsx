
import Dashboard from './views/dashboard';
import Chat from './views/chat';
import History from './views/history';
import Statistics from './views/statistics';
import Profile from './views/profile';
import Contact from './views/contact';
import Setting from './views/setting';
import Layout from './views/layout';
import Agent from './views/agent';
import Notice from './views/notice';
import NotFound from './views/notFound';
import Appstore from './views/appstore';
import ViewApp from './views/appstore/viewApp';
import LimitTips from './views/limitTips';

export default function getRoutes() {
    const routes = [
        {
            path: '/',
            component: Layout,
            indexRoute: {
                component: Dashboard,
                name: '首页',
            },
            childRoutes: [
                {
                    path: 'chat',
                    name: '对话',
                    component: Chat,
                    // eslint-disable-next-line consistent-return
                    onChange: (prevState, nextState, replace, callback) => {
                        const nextPathname = nextState.location.pathname;

                        if (prevState.params.id
                            && (nextPathname === 'chat' || nextPathname === '/chat')
                        ) {
                            return false;
                        }

                        callback();
                    },
                    childRoutes: [
                        {
                            path: ':id',
                            component: Chat,
                        },
                    ],
                },
                {
                    path: 'history',
                    name: '历史',
                    component: History,
                },
                {
                    path: 'notice',
                    name: '系统通知',
                    component: Notice,
                },
                {
                    path: 'statistics',
                    name: '统计',
                    component: Statistics,
                    childRoutes: [
                        {
                            path: ':type',
                            component: Statistics,
                        },
                    ],
                },
                {
                    path: 'contact',
                    name: '联系人',
                    component: Contact,
                },
                {
                    path: 'agent',
                    name: '客服团队',
                    component: Agent,
                    childRoutes: [
                        {
                            path: ':type',
                            component: Agent,
                        },
                    ],
                },
                {
                    path: 'profile',
                    name: '个人设置',
                    component: Profile,
                    childRoutes: [
                        {
                            path: ':type',
                            component: Profile,
                        },
                    ],
                },
                {
                    path: 'appstore',
                    name: '应用',
                    component: Appstore,
                    childRoutes: [{
                        path: ':id',
                        component: ViewApp,
                    }],
                },
                {
                    path: 'setting',
                    name: '设置',
                    component: Setting,
                    childRoutes: [
                        {
                            path: ':type',
                            component: Setting,
                        },
                    ],
                },
                {
                    path: 'limit',
                    name: '在线座席提示',
                    component: LimitTips,
                },
                {
                    path: '*',
                    name: '页面未找到',
                    component: NotFound,
                },
            ],
        },
    ];

    return routes;
}
