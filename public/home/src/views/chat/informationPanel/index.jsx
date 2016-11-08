import React from 'react';
import { Form, Input, Tabs, Select, Tag, Button, Popover, Icon, Message, Timeline, Pagination } from 'antd';
import reqwest from 'reqwest';
import { Link } from 'react-router';
import store from 'network/store';
import GlobalFun from 'modules/globalFun';
import SourceDevices from 'views/components/SourceDevices';
import InformationForm from './informationForm';

const FormItem = Form.Item;
const TabPane = Tabs.TabPane;
const Option = Select.Option;

export default class InformationPanel extends React.Component
{
    state = {
        categories: [],
        contact: { tags: [], package: {} },
        sourceContact: {},
        order: {},
        tags: [],
        plugin: {},
        category: null,
        currentPluginTab: '0',
        tracks: []
    };

    onTabChange = (currentPluginTab) => {
        this.setState({ currentPluginTab });
    };

    onChange = (e) => {
        e.preventDefault();
        let contact = this.state.contact;
        contact[e.target.name] = e.target.value;
        this.setState({
            contact: contact,
            defaultCategory: null,
        });
    };

    onBlur = (e) => {
        const contact = this.props.contact;
        const target = e.target;
        let value = target.value.trim();
        value = value == '' ? null : value;
        if (contact[target.name] != value) {
            this.props.updateContact(e);
            store.contact.save({
                id: contact.id,
                [target.name]: value,
            }).then((resp) => {
                if (resp.success) {
                    Message.success('保存成功');
                }
            });
        }
    };

    onSaveTags = (tags) => {
        this.props.saveContact(this.props.contact.id, tags)
    };

    onCategorySearch = (category) => {
        this.setState({
            category: category,
        });
    };

    onSaveCategory = (category) => {

        if (this.state.category) {
            category = this.state.category;
        }

        if (this.props.order.category && this.props.order.category.title == category) {
            return ;
        }

        this.props.saveOrder(this.props.order.id, {category: category})
    };

    categories = (resp) => {
        this.setState({
            categories: resp.data.data,
        });
    };

    plugin = (resp) => {
        if (resp.data.data.plugin) {
            this.setState({
                plugin: resp.data.data,
                currentPluginTab: '2',
            });
        }
    };

    tags = (resp) => {
        this.setState({
            tags: resp.data.data,
        });
    };

    contact = (resp) => {
        this.setState({
            contact: Object.assign({}, resp.data.data),
            sourceContact: Object.assign({}, resp.data.data),
        });
    };

    order = (resp) => {
        this.setState({
            order: resp.data.data,
            category: null,
        });
        store.order.category.reload();
    };

    componentDidMount() {
        const order = this.props.order;
        store.order.category.subscribe(this.categories);
        store.setting.plugin.subscribe(this.plugin);
        store.tag.subscribe(this.tags);
        store.contact.subscribe(order.contact_id, this.contact);
        store.order.all.subscribe(order.id, this.order);
        store.track.subscribe(this.onTrackLoaded, false);
    }

    componentWillUnmount() {
        const order = this.props.order;
        store.order.category.unsubscribe(this.categories);
        store.setting.plugin.unsubscribe(this.plugin);
        store.tag.unsubscribe(this.tags);
        store.contact.unsubscribe(order.contact_id, this.contact);
        store.order.all.unsubscribe(order.id, this.order);
        store.track.unsubscribe(this.onTrackLoaded);
    }

    onTrackLoaded = (e) => {
        if (e.condition && e.condition._id === this.props.contact.track_id) {
             this.props.contact.track = e.data.data;
             this.props.contact.trackIsLoading = false;
             this.renderTrack(e.data);
         }
    }

    onPageChange = (page) => {
        store.track.reload({
            _id: this.props.contact.track_id,
            date: this.props.contact.visit_date,
            page: page
        });
    }

    renderTrack = (resp) => {
        // 构造Timeline组件
        const trackData = this.props.contact.track;
        const pagination = {
            total: resp.total,
            current: resp.currentPage,
            size: 'small',
            simple: {},
            showTotal: (total) => { return `共${total}条`; },
        };

        let track = '';

        if (!trackData.length) {
            track = '没有数据!';
        } else {
            const timelineItems = trackData.map((item, index) => {
                return (
                    <Timeline.Item key={ index }>
                        <span>{ item.created_at.substr(11) }</span>
                        <a target="_blank" href={ item.url }>{ item.title }</a>
                    </Timeline.Item>
                );
            });

            track = (
                <div>
                    <h5>{ trackData[0].date }</h5>
                    <Timeline>
                        { timelineItems }
                    </Timeline>
                    { resp.total > 10 && <Pagination { ...pagination } onChange={this.onPageChange} />  }
                </div>

            );
        }
        const trackView = <div className="customer-source-pop">{ track }</div>;

        this.props.contact.trackView = trackView;
        this.setState({
            trackView: trackView
        });

    }

    onVisibleChange = (visible) => {
        this.setState({
            visible: visible
        });
    }

    renderTags = (contact) => {
        let defaultTags = contact.tags.map((tag) => {return tag.name;});
        const tags = [];
            this.state.tags.map((tag) => {
                tags.push(<Option key={tag.id} value={tag.name}>{tag.name}</Option>);
            });
            return (<Select
                tags
                style={{ width: '80%' }}
                value={ defaultTags }
                onChange={this.onSaveTags}
                searchPlaceholder="添加标签"
            >
                {tags}
            </Select>);
    }

    render() {
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 14 },
        };
        const contact = this.props.contact;
        const order = this.props.order;
        let extend = '';
        let sourceData = [];
        let devices = '';
        if (contact) {
            if (contact.track_id && !contact.track && !contact.trackIsLoading) {
                // 根据track_id查询访客轨迹
                store.track.load({
                    _id: contact.track_id,
                    date: contact.visit_date,
                    limit: 10
                });
                contact.trackIsLoading = true;
            }

            if (contact.source) {
                const source = contact.source;

                function sourceRenderer(label, value) {
                    return (
                        <FormItem
                            {...formItemLayout}
                            label={ label }
                            key={ Math.random() }>
                            <span>{ value }</span>
                        </FormItem>
                    );
                }

                sourceData.push(sourceRenderer('类型', source.type));

                switch (source.type) {
                    case '电话':
                        sourceData.push(sourceRenderer('号码', source.number));
                        sourceData.push(sourceRenderer('归属', source.location));
                        break;
                    case '邮件':
                        sourceData.push(sourceRenderer('邮箱', source.email));
                        break;
                    case '网站':
                        sourceData.push(sourceRenderer('名称', source.site_name));
                        sourceData.push(
                            <FormItem
                                {...formItemLayout}
                                label="途径"
                                className="customer-source-item"
                                key="100">
                                <p>
                                    <a href={ source.href } target="_blank" title={ source.href }>{ source.name }</a>
                                    <Popover content={ contact.trackView || this.state.trackView } title="客户轨迹" placement="topRight" trigger="click" visible={ this.state.visible } onVisibleChange={ this.onVisibleChange }>
                                        <Icon type="caret-circle-o-down" />
                                    </Popover>
                                </p>
                            </FormItem>
                        );
                        if (source.keyword) {
                            sourceData.push(sourceRenderer('关键词', source.keyword));
                        }
                        break;
                    case '微博':
                        sourceData.push(sourceRenderer('帐号', source.name));
                        sourceData.push(
                            <FormItem
                                {...formItemLayout}
                                label="链接"
                                className="customer-source-item"
                                key={ Math.random() }>
                                <p>
                                    <a href={ source.url } target="_blank" title={ source.url }>{ source.url }</a>
                                </p>
                            </FormItem>
                        );
                        break;
                    case '微信':
                        sourceData.push(sourceRenderer('公众号', contact.wechat ? contact.wechat.nick_name : null));
                        break;
                }







                // return;
                // source = (
                //     <FormItem
                //         {...formItemLayout}
                //         label="来源"
                //         className="customer-source-item">
                //         <p>
                //             <a href={ sourceData.href } target="_blank" title={ sourceData.href }>{ sourceData.name }</a>
                //             <Popover content={ contact.trackView || this.state.trackView } title="客户轨迹" placement="topRight" trigger="click">
                //                 <Icon type="caret-circle-o-down" />
                //             </Popover>
                //         </p>
                //     </FormItem>
                // );
                //
                // if (sourceData.keyword) {
                //     keyword = (
                //         <FormItem
                //             {...formItemLayout}
                //             label="关键词">
                //             <span>{ sourceData.keyword }</span>
                //         </FormItem>
                //     );
                // }
            }

            if (contact.package) {
                let pkg = contact.package;
                if (pkg.user_agent) {
                    devices = (
                        <SourceDevices userAgent={ pkg.user_agent } />
                    );
                }
            }

            if (contact.extend && contact.extend.length) {
                const layout = {
                    labelCol: { span: 8 },
                    wrapperCol: { span: 14 },
                };
                extend = (<div className="info-item">
                    <h4>扩展信息</h4>
                    <Form horizontal>
                        {
                            contact.extend.map((item, i) => {
                                return (
                                    <FormItem key={i}
                                        {...layout}
                                        label={`${item.key}：`}>
                                        <p>{item.value}</p>
                                    </FormItem>
                                );
                            })
                        }
                    </Form>
                </div>);
            }
        }

        let categoryContent = null;
        if (this.state.categories && order.id) {
            let categories = [];
            this.state.categories.map((category) => {
                categories.push(<Option key={category.id} value={category.title}>{category.title}</Option>);
            });
            categoryContent = (<Select
                showSearch
                style={{ width: '80%' }}
                value={order.category ? order.category.title : ''}
                onSearch={this.onCategorySearch}
                onBlur={this.onSaveCategory}
                onChange={this.onSaveCategory}
                searchPlaceholder="添加分类"
            >
                {categories}
            </Select>);
        }

        let pluginContent = '';
        if (this.state.plugin.plugin) {
            const setting = this.props.setting;
            if (setting.plan.slug === 'experience') {
                pluginContent = <div className="plan-expired">
                    <p>套餐已到期，请续费后使用插件</p>
                    <Link to="/setting/combo">点击续费</Link>
                </div>
            } else {
                pluginContent = <iframe className="plugin" src={ `${this.state.plugin.plugin}?extend_id=${contact.extend_id}&contact_id=${contact.id}` } />;
            }
        } else {
            pluginContent = (
                <div key="0" style={{ textAlign: 'center', paddingTop: 20 }}>
                    <p>
                        <Icon type="frown" />
                        <span key="0">{' '}未开通插件</span>
                    </p>
                    <Link to="/setting/plugin">马上开通</Link>
                </div>
            );
        }

        return (
            <div className="information">
                <Tabs activeKey={ this.state.currentPluginTab } onChange={this.onTabChange}>
                    <TabPane tab="客户信息" key="1">
                        <div className="info-item">
                            <h4>客户资料</h4>
                            <div className="items">
                                <InformationForm
                                    onBlur={this.onBlur}
                                    formItemLayout={formItemLayout}
                                    contact={this.props.contact}
                                />
                            </div>
                        </div>

                        {extend}

                        <div className="info-item">
                            <h4>访问信息</h4>
                            <Form horizontal>
                                <FormItem
                                    {...formItemLayout}
                                    label="地址："
                                >
                                    <p>{contact.package.address}</p>
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="IP："
                                >
                                    <p>{contact.ip}</p>
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="设备："
                                >
                                    {devices}
                                </FormItem>
                            </Form>
                        </div>

                        <div className="info-item">
                            <h4>来源</h4>
                            <Form horizontal>
                                { sourceData }
                            </Form>
                        </div>

                        <div className="info-item">
                            <h4>标签</h4>
                            { this.renderTags(contact) }
                        </div>

                        <div className="info-item">
                            <h4>对话归类</h4>
                            { categoryContent }
                        </div>
                    </TabPane>
                    <TabPane tab="插件" key="2">
                        {pluginContent}
                    </TabPane>
                </Tabs>
            </div>
        );
    }
}
