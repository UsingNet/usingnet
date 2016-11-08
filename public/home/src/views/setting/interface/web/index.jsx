import React from 'react';
import { Tabs, Button, Tooltip } from 'antd';
import SiteForm from './siteForm';
import config from './defaultConfig';
import store from 'network/store';

import './web.less';

const TabPane = Tabs.TabPane;


export default class Web extends React.Component {
    state = {
        sites: [],
        currentTab: '0',
        orderFormItemType: 'input',
        formEditVisible: false,
        pageDistanceCustomVisible: false,
        orderFormData: {
            title: '',
            items: [{
                type: 'input',
                placeholder: '',
            }],
        },
        currentOrderIndex: 0,
    };

    componentDidMount() {
        store.setting.web.subscribe(this.site);
    }

    componentWillUnmount() {
        store.setting.web.unsubscribe(this.site);
    }

    onAddSite = () => {
        const sites = this.state.sites;
        if (sites[sites.length - 1].id) {
            sites.push(config.defaultSite);
            this.setState({
                sites,
                currentTab: sites.length - 1 + '',
            });
        }
    };

    onChange = (currentTab) => {
        this.setState({
            currentTab,
            currentOrderIndex: 0,
        });
    }

    onEdit = (targetKey, action) => {
        this[action](targetKey);
    }

    onRemove = () => {
        const currentTab = Number(this.state.currentTab);
        let sites = this.state.sites;
        if (sites.length === 1) {
            return;
        }
        const site = sites[currentTab];
        sites = sites.filter((s, i) => i !== currentTab);
        if (!site.id) {
            this.setState({
                sites,
                currentTab: '0',
            });
        } else {
            store.setting.web.remove(site.id);
        }
    }

    onEditOrderForm = () => {
        const currentTab = Number(this.state.currentTab);
        const currentSite = this.state.sites[currentTab];
        const orderFormData = JSON.parse(JSON.stringify(currentSite.order[this.state.currentOrderIndex]));
        this.setState({
            formEditVisible: true,
            orderFormData,
        });
    }

    onChangeOrderForm = (index) => {
        const currentTab = Number(this.state.currentTab);
        const currentSite = this.state.sites[currentTab];
        const orderFormData = currentSite.order[index];

        this.setState({
            orderFormData,
            currentOrderIndex: index,
        });
    }

    showPageDistanceEdit = () => {
        this.setState({
            pageDistanceCustomVisible: true,
        });
    }

    hidePageDistanceEdit = (pageDistanceCustomVisible) => {
        this.setState({
            pageDistanceCustomVisible,
        });
    }

    completeEditOrderForm = () => {
        const currentTab = Number(this.state.currentTab);
        const currentSite = this.state.sites[currentTab];
        if (this.state.currentOrderIndex === currentSite.order.length) {
            currentSite.order.unshift(this.state.orderFormData);
            this.setState({
                currentOrderIndex: 0,
            });
        } else {
            currentSite.order[this.state.currentOrderIndex] = this.state.orderFormData;
        }

        this.setState({
            formEditVisible: false,
            sites: this.state.sites,
        });
    }

    cancelEditOrderForm = () => {
        this.setState({
            formEditVisible: false,
        });
    }

    addOrderForm = () => {
        this.setState({
            formEditVisible: true,
            orderFormData: {
                title: '',
                items: [{
                    placeholder: '',
                    type: 'input',
                }],
            },
            currentOrderIndex: this.state.currentOrderIndex + 1,
        });
    }

    addOrderFormItem = () => {
        const oldItems = this.state.orderFormData.items;

        this.setState({
            orderFormData: {
                ...this.state.orderFormData,
                ...{ items: oldItems.concat([{ placeholder: '', type: 'input' }]) },
            },
        });
    }

    updateSite = (partialData) => {
        const keys = Object.keys(partialData);
        for (const key of keys) {
            const currentTab = Number(this.state.currentTab);
            const currentSite = {
                ...this.state.sites[currentTab],
                ...{ [key]: partialData[key].value },
            };

            const shallowCopySites = this.state.sites.slice();
            shallowCopySites[currentTab] = currentSite;

            this.setState({
                sites: shallowCopySites,
            });
        }
    }

    updateOrderForm = (partialData) => {
        const keys = Object.keys(partialData);
        for (const key of keys) {
            this.state.orderFormData[key] = partialData[key].value;

            this.setState({
                orderFormData: this.state.orderFormData,
            });
        }
    }

    changeOrderItemType = (value, index) => {
        this.state.orderFormData.items[index].type = value;
        this.setState({
            orderFormItemType: this.state.orderFormData,
        });
    }

    updateOrderFormItemValue = (e, index) => {
        this.state.orderFormData.items[index].placeholder = e.target.value;
        this.setState({
            orderFormData: this.state.orderFormData,
        });
    }

    upOrderFormItem = (index) => {
        const items = this.state.orderFormData.items;
        const prevIndex = index - 1;
        if (index > 0 && index < items.length) {
            [items[index], items[prevIndex]] = [items[prevIndex], items[index]];
        }

        this.setState({
            orderFormData: this.state.orderFormData,
        });
    }

    downOrderFormItem = (index) => {
        const items = this.state.orderFormData.items;
        const nextIndex = index + 1;
        if (index >= 0 && nextIndex < items.length) {
            [items[index], items[nextIndex]] = [items[nextIndex], items[index]];
        }

        this.setState({
            orderFormData: this.state.orderFormData,
        });
    }

    removeOrderFormItem = (index) => {
        const items = this.state.orderFormData.items;
        items.splice(index, 1);

        this.setState({
            orderFormData: this.state.orderFormData,
        });
    }

    site = (e) => {
        this.setState({
            sites: e.data.data,
        });
    }

    render() {
        const setting = this.props.setting;
        let operations = '';
        if (setting.plan && setting.plan.slug === 'flagship') {
            operations = (
                <div className="action">
                    <Button onClick={this.onAddSite}>添加站点</Button>
                </div>
            );
        } else {
           operations = <div className="action">
               <Tooltip title="请升级旗舰版套餐使用多站点" placement="left">
                   <Button disabled>添加站点</Button>
               </Tooltip>
            </div>
        }

        return (
            <div className="sites">
                <h4>网站接入</h4>
                <Tabs
                    tabBarExtraContent={operations}
                    activeKey={this.state.currentTab}
                    onEdit={this.onEdit}
                    onChange={this.onChange}
                >
                    {
                        this.state.sites.map((result, i) => (
                            <TabPane
                                key={i}
                                tab={result.name ? result.name : '新站点'}
                            >
                                <SiteForm
                                    pageDistanceCustomVisible={this.state.pageDistanceCustomVisible}
                                    formEditVisible={this.state.formEditVisible}
                                    data={result}
                                    type={this.state.type}
                                    showPageDistanceEdit={this.showPageDistanceEdit}
                                    hidePageDistanceEdit={this.hidePageDistanceEdit}
                                    updateSite={this.updateSite}
                                    addOrderForm={this.addOrderForm}
                                    addOrderFormItem={this.addOrderFormItem}
                                    changeOrderItemType={this.changeOrderItemType}
                                    onChangeOrderForm={this.onChangeOrderForm}
                                    onEditOrderForm={this.onEditOrderForm}
                                    onRemove={this.onRemove}
                                    sites={this.state.sites}
                                    orderFormData={this.state.orderFormData}
                                    updateOrderForm={this.updateOrderForm}
                                    updateOrderFormItemValue={this.updateOrderFormItemValue}
                                    upOrderFormItem={this.upOrderFormItem}
                                    downOrderFormItem={this.downOrderFormItem}
                                    removeOrderFormItem={this.removeOrderFormItem}
                                    completeEditOrderForm={this.completeEditOrderForm}
                                    cancelEditOrderForm={this.cancelEditOrderForm}
                                />
                            </TabPane>)
                        )
                    }
                </Tabs>
            </div>
        );
    }
}
