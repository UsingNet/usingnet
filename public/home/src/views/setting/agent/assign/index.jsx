import React, { PropTypes } from 'react';
import { Form, Switch, Card, Button, Select, Input, message } from 'antd';
import Store from 'network/store';
import './assign.less';

const FormItem = Form.Item;
const Option = Select.Option;

class AssignForm extends React.Component {
    state = {
        submitweb: [],
        submitwebRule: [],
        submitwechat: [],
        submitweibo: [],
        sites: [],
        groups: [],
        weibos: [],
        wechats: [],
        voip: {},
        email: {},
        assign: {},
        newRuleUrl: '',
        newRuleGroups: [],
    }

    componentDidMount() {
        Store.setting.assign.subscribe(this.onAssignGet);
        Store.user.group.subscribe(this.onGroupsGet, false);
        Store.setting.web.subscribe(this.onSitesGet, false);
        Store.setting.weibo.subscribe(this.onWeiboGet, false);
        Store.setting.wechat.subscribe(this.onWechatGet, false);
        Store.setting.voip.subscribe(this.onVoipGet, false);
        Store.setting.email.subscribe(this.onEmailGet, false);
    }

    componentWillUnmount() {
        Store.setting.assign.unsubscribe(this.onAssignGet);
        Store.user.group.unsubscribe(this.onGroupsGet);
        Store.setting.web.unsubscribe(this.onSitesGet);
        Store.setting.weibo.unsubscribe(this.onWeiboGet);
        Store.setting.wechat.unsubscribe(this.onWechatGet);
        Store.setting.voip.unsubscribe(this.onVoipGet);
        Store.setting.email.unsubscribe(this.onEmailGet);
    }

    onAssignGet = (e) => {
        const data = e.data.data;
        this.setState({
            assign: data,
        });

        this.props.form.setFieldsValue({
            repeat: data.repeat === 1,
            voip: data.voip,
            mail: data.mail,
        });

        if (!this.loadOnce) {
            Store.user.group.load();
            Store.setting.web.load();
            Store.setting.weibo.load();
            Store.setting.wechat.load();
            Store.setting.voip.load();
            Store.setting.email.load();

            this.loadOnce = true;
        }
    }

    onGroupsGet = (e) => {
        this.setState({
            groups: e.data.data,
        });
    }

    onSitesGet = (e) => {
        this.setState({
            sites: e.data.data,
        });
    }

    onWechatGet = (e) => {
        this.setState({
            wechats: e.data.data,
        });
    }

    onWeiboGet = (e) => {
        this.setState({
            weibos: e.data.data,
        });
    }

    onVoipGet = (e) => {
        this.setState({
            voip: e.data.data,
        });
    }

    onEmailGet = (e) => {
        this.setState({
            email: e.data.data,
        });
    }

    onSiteGroupChange = (values, id) => {
        this.setGroups('web_id', id, values, 'web');
    }

    onWechatGroupChange = (values, id) => {
        this.setGroups('wechat_id', id, values, 'wechat');
    }

    onWeiboGroupChange = (values, id) => {
        this.setGroups('weibo_id', id, values, 'weibo');
    }

    onRuleUrlAddChange = (e) => {
        const url = e.target.value;
        this.setState({
            newRuleUrl: url,
        });
    }

    onRuleGroupAddChange = (values) => {
        this.setState({
            newRuleGroups: values,
        });
    }

    onRuleGroupAdd = () => {
        const url = this.state.newRuleUrl;
        const exists = this.state.assign.web_rule.find(w => w.url === url);
        if (exists) {
            message.error('链接已存在');
        } else {
            if (!!url.match(this.urlRegex)) {
                const newRule = {
                    url,
                    group_id: this.state.newRuleGroups,
                };

                this.state.assign.web_rule.push(newRule);

                this.setState({
                    assign: this.state.assign,
                    newRuleUrl: '',
                    newRuleGroups: [],
                }, () => {
                    this.onSubmit();
                });
            } else {
                message.error('请填写正确的url');
            }
        }
    }

    onRuleUpdate = () => {
        this.onSubmit();
    }

    onRuleRemove = (index) => {
        this.state.assign.web_rule.splice(index, 1);

        this.setState({
            assign: this.state.assign,
        }, () => {
            this.onSubmit();
        });
    }

    onExistsRuleUrlChange = (event, prevUrl) => {
        const url = event.target.value;

        if (!!url.match(this.urlRegex)) {
            const exist = this.state.assign.web_rule.find(rule => rule.url === prevUrl);
            exist.url = url;
            this.setState({
                assign: this.state.assign,
            });
        } else {
            message.error('请填写正确的url');
        }
    }

    onRuleGroupChange = (values, url) => {
        this.setGroups('url', url, values, 'web_rule');
    }

    onSubmit = () => {
        const assign = this.state.assign;
        const formValues = this.props.form.getFieldsValue();
        formValues.repeat = formValues.repeat ? 1 : 0;
        const data = {
            ...formValues,
            ...{
                web: assign.web,
                web_rule: assign.web_rule,
                wechat: assign.wechat,
                weibo: assign.weibo,
            },
        };

        Store.setting.assign.save(data).then(resp => {
            if (resp.success) {
                message.info('保存成功');
            } else {
                message.error(resp.msg);
            }
        });
    }

    setGroups = (k, v, values, type) => {
        const exist = this.state.assign[type].find(t => t[k] === v);

        if (exist) {
            exist.group_id = values;

            this.setState({
                assign: this.state.assign,
            }, () => {
                this.onSubmit();
            });
        } else {
            this.state.assign[type].push({ [k]: v, group_id: values });
            this.setState({
                assign: this.state.assign,
            }, () => {
                this.onSubmit();
            });
        }
    }

    // from https://github.com/yiminghe/async-validator/blob/master/src/rule/type.js
    urlRegex = new RegExp('^(?!mailto:)(?:(?:http|https|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$', 'i')

    render() {
        const { getFieldProps } = this.props.form;
        const formItemLayout = {
            wrapperCol: { span: 16 },
        };
        const self = this;

        const assign = this.state.assign;

        const groupsNode = this.state.groups.map(group => (
            <Option key={group.id} value={group.id}>{group.name}</Option>
        ));

        const sitesNode = this.state.sites.map(site => {
            const siteWithGroup = assign.web.find(w => w.web_id === site.id) || {};

            return (
                <div
                    className="group site"
                    key={site.id}
                >
                    <h4>{site.name}</h4>
                    <Select
                        value={siteWithGroup.group_id}
                        onChange={values => this.onSiteGroupChange(values, site.id)}
                        placeholder="请选择客服分组"
                        multiple
                    >
                        {groupsNode}
                    </Select>
                </div>
            );
        });

        let webRuleNode = '';

        if (assign && assign.web_rule) {
            webRuleNode = assign.web_rule.map((rule, index) => (
                <div
                    key={index}
                    className="group web-rule"
                >
                    <Input
                        defaultValue={rule.url}
                        onBlur={e => this.onExistsRuleUrlChange(e, rule.url)}
                        placeholder="请填写URL"
                    />
                    <Select
                        value={rule.group_id}
                        onChange={values => this.onRuleGroupChange(values, rule.url)}
                        placeholder="请选择客服分组"
                        multiple
                    >
                        {groupsNode}
                    </Select>

                    <Button
                        className="update-rule"
                        type="ghost"
                        onClick={() => this.onRuleUpdate(rule.url)}
                    >
                        更新
                    </Button>

                    <Button
                        className="remove-rule"
                        type="ghost"
                        onClick={() => this.onRuleRemove(index)}
                    >
                        删除
                    </Button>
                </div>
            ));
        }

        const wechatNode = this.state.wechats.map(wechat => {
            const wechatWithGroup = assign.wechat.find(w => w.wechat_id === wechat.id) || {};

            return (
                <div
                    className="group wechat"
                    key={wechat.id}
                >
                    <h4>{wechat.nick_name}</h4>
                    <Select
                        value={wechatWithGroup.group_id}
                        onChange={values => this.onWechatGroupChange(values, wechat.id)}
                        placeholder="请选择客服分组"
                        multiple
                    >
                        {groupsNode}
                    </Select>
                </div>
            );
        });

        const weiboNode = this.state.weibos.map(weibo => {
            const weiboWithGroup = assign.weibo.find(w => w.weibo_id === weibo.id) || {};

            return (
                <div
                    className="group weibo"
                    key={weibo.id}
                >
                    <h4>{weibo.name}</h4>
                    <Select
                        value={weiboWithGroup.group_id}
                        onChange={values => this.onWeiboGroupChange(values, weibo.id)}
                        placeholder="请选择客服分组"
                        multiple
                    >
                        {groupsNode}
                    </Select>
                </div>
            );
        });

        const voipNode = (
            <Card title={`电话设置（${this.state.voip.bind_number}）`}>
                <h4>可接听电话的客服组：</h4>
                <Select
                    {...getFieldProps('voip', {
                        onChange(values) {
                            self.state.assign.voip = values;
                            self.setState({
                                assign: self.state.assign,
                            }, () => {
                                self.onSubmit();
                            });
                        },
                    })}
                    placeholder="请选择客服分组"
                    multiple
                >
                    {groupsNode}
                </Select>
            </Card>
        );

        const emailNode = (
            <Card title={`邮件设置（${this.state.email.email}）`}>
                <h4>可接收邮件的客服组：</h4>
                <Select
                    {...getFieldProps('mail', {
                        onChange(values) {
                            self.state.assign.mail = values;
                            self.setState({
                                assign: self.state.assign,
                            }, () => {
                                self.onSubmit();
                            });
                        },
                    })}
                    placeholder="请选择客服分组"
                    multiple
                >
                    {groupsNode}
                </Select>
            </Card>
        );

        return (
            <div className="agent-assign">
                <h3>
                    客服分配
                </h3>

                <Form horizontal>
                    <FormItem
                        {...formItemLayout}
                    >
                        <Card
                            title="优先设置"
                        >
                            <label>优先转接到上次接待的客服：</label>
                            <Switch
                                {...getFieldProps('repeat', {
                                    valuePropName: 'checked',
                                    onChange(value) {
                                        self.state.assign.repeat = value ? 1 : 0;
                                        self.setState({
                                            assign: self.state.assign,
                                        }, () => {
                                            self.onSubmit();
                                        });
                                    },
                                })}
                            />

                        </Card>

                    </FormItem>

                    <FormItem
                        {...formItemLayout}
                        className="group-card site-setting"
                    >
                        <Card
                            title="网站设置（指定各个网站的客服组）"
                            className="site-group-card"
                        >
                            {sitesNode}
                        </Card>
                    </FormItem>

                    <FormItem
                        {...formItemLayout}
                        className="group-card rule-setting"
                    >
                        <Card
                            className="rule-group-card"
                            title="网站规则（指定填写的 URL 的客服组）"
                        >
                            <div className="group web-rule">
                                <Input
                                    value={this.state.newRuleUrl}
                                    placeholder="请填写URL"
                                    onChange={this.onRuleUrlAddChange}
                                />
                                <Select
                                    value={this.state.newRuleGroups}
                                    onChange={this.onRuleGroupAddChange}
                                    placeholder="请选择客服分组"
                                    multiple
                                >
                                    {groupsNode}
                                </Select>

                                <Button
                                    className="add-rule"
                                    type="ghost"
                                    onClick={this.onRuleGroupAdd}
                                >
                                    添加
                                </Button>
                            </div>
                            {webRuleNode}
                        </Card>
                    </FormItem>

                    <FormItem
                        {...formItemLayout}
                        className="group-card wechat-setting"
                    >
                        <Card
                            title="微信设置（指定各个微信的客服组）"
                            className="wechat-group-card"
                        >
                            {wechatNode}
                        </Card>
                    </FormItem>

                    <FormItem
                        {...formItemLayout}
                        className="group-card weibo-setting"
                    >
                        <Card
                            title="微博设置（指定各个微博的客服组）"
                            className="weibo-group-card"
                        >
                            {weiboNode}
                        </Card>
                    </FormItem>

                    <FormItem
                        {...formItemLayout}
                    >
                        {voipNode}
                    </FormItem>

                    <FormItem
                        {...formItemLayout}
                    >
                        {emailNode}
                    </FormItem>
                </Form>
            </div>
        );
    }
}

AssignForm.propTypes = {
    form: PropTypes.object,
};

const Assign = Form.create()(AssignForm);

export default Assign;
