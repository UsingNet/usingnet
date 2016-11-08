import React from 'react';
import { Card, Form, InputNumber, Radio, Button, Row, Col, Steps, Table, Checkbox, Modal, Message } from 'antd';
import Reqwest from 'reqwest';
import Store from 'network/store';
import './combo.less';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const createFrom = Form.create;
const Step = Steps.Step;
const Confirm = Modal.confirm;

class ComboForm extends React.Component {
    state = {
        comboId: '',
    };

    radioGroupOnChange = (e) => {
        this.setState({
            comboId: e.target.value,
        });
    }

    getFromDate = (key = '') => {
        const endAt = this.props.currentCombo.end_at;
        if (endAt) {
            const date = new Date(endAt);
            const dateObj = {
                year: date.getFullYear(),
                month: date.getMonth() + 1,
                day: date.getDate()
            };
            return dateObj[key];
        }
        return 0;
    }

    render() {
        const { getFieldProps } = this.props.form;
        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 21 }
        };

        const currentComboPrice = this.props.currentCombo.price;
        const currentComboId = this.props.currentCombo.plan_id;
        const currentAgentNum = this.props.currentCombo.agent_num;

        const combos = this.props.combos;

        return (
            <Form horizontal>
                <FormItem { ...formItemLayout } label="请选择套餐：" className="combo-radio">
                    <RadioGroup value={ this.state.comboId } onChange={ this.radioGroupOnChange } { ...getFieldProps('plan_id', { initialValue: parseInt(currentComboId) }) } >
                        {
                            combos.map((item, index) => {
                                return (
                                    <Radio key={ item.id } value={ item.id } disabled={ parseInt(item.price) < parseInt(currentComboPrice) } className={ parseInt(item.price) < parseInt(currentComboPrice) ? 'disabled-combo-radio' : '' }>
                                        <div className="plan-card" style={{ color: item.color }}>
                                            <div className="plan-card-header">
                                                <h1>{ item.name }</h1>
                                                <span>{ item.fit_for }</span>
                                            </div>
                                            <div className="plan-card-body">
                                                <small>￥</small><span>{ parseFloat(item.price) }</span><small>/坐席/年</small>
                                            </div>
                                            <div className="plan-card-footer">
                                                <span>{ item.desc }</span>
                                            </div>
                                        </div>
                                    </Radio>
                                );
                            })
                        }
                    </RadioGroup>
                </FormItem>

                <FormItem { ...formItemLayout } label="坐席数：">
                    <InputNumber
                        min={ parseInt(currentAgentNum) }
                        max={ 99 }
                        { ...getFieldProps('agent_num', { initialValue: parseInt(currentAgentNum) }) } />
                    <span className="ant-form-text">个</span>
                </FormItem>

                <FormItem { ...formItemLayout } label="到期时间：">
                    <InputNumber
                        min={ this.getFromDate('year') }
                        max={ 2030 }
                        { ...getFieldProps('year', { initialValue: this.getFromDate('year') }) } />
                    <span className="ant-form-text"> 年 { this.getFromDate('month') } 月 { this.getFromDate('day') } 日</span>
                </FormItem>

            </Form>
        );
    }
}

class CurrentSetting extends React.Component {
    state = {
        costs: '0.00'
    };

    getFromDate = (key = '') => {
        this.initialEndAt = this.props.comboSetting.end_at || this.initialEndAt;
        if (this.initialEndAt) {
            const date = new Date(this.initialEndAt);
            const dateObj = {
                year: date.getFullYear(),
                month: date.getMonth() + 1,
                day: date.getDate()
            };
            return dateObj[key];
        }
    }

    onClickBuyingButton = () => {
        this.props.changeStep(1);
    }

    render() {
        const comboSetting = this.props.comboSetting;

        return (
            <div className='current-setting'>
                <div className='current-setting-header'>
                    <h1>当前设置</h1>
                </div>
                <div className='current-setting-body'>
                    <ul>
                        <li>
                            <span>套餐类型：</span><span>{ comboSetting.name }</span>
                        </li>
                        <li>
                            <span>套餐价格：</span><span>￥<big>{ comboSetting.price }</big>/坐席/年</span>
                        </li>
                        <li>
                            <span>坐席数：</span><span>{ comboSetting.agent_num }个</span>
                        </li>
                        <li>
                            <span>到期时间：</span>{ comboSetting.year || this.getFromDate('year') }年{ this.getFromDate('month') }月{ this.getFromDate('day') }日<span></span>
                        </li>
                        <li>
                            <span>费用：</span><span>￥<big>{ this.state.costs }</big></span>
                        </li>
                        <li>
                            <Button className={ !parseInt(this.state.costs) ? "combo-disabled-button" : "" } disabled={ !parseInt(this.state.costs) } onClick={ this.onClickBuyingButton }>购买</Button>
                        </li>
                    </ul>
                </div>
            </div>
        );
    }
}

export default class SettingCombo extends React.Component {
    state = {
        comboSetting: null,
        currentStep: 0,
        balance: '0.00',
        payFromBalance: null,
        useBalance: true
    };
    componentWillMount() {
        const me = this;
        ComboForm = createFrom({
            onFieldsChange: (props, fields) => {
                const data = me.refs.comboForm.getForm().getFieldsValue();
                const combos = me.props.combos;
                const combo = combos.filter((item, index) => {
                    return data.plan_id === item.id;
                });
                data['name'] = combo[0].name;
                data['price'] = combo[0].price;
                me.setState({
                    comboSetting: data
                });

                Reqwest({
                    url: '/api/account/plan/balance',
                    data: me.refs.comboForm.getForm().getFieldsValue()
                })
                .then((resp) => {
                    if (resp.success && me.refs.currentSetting) {
                        me.refs.currentSetting.setState({
                            costs: resp.costs
                        });
                    }
                })
                .fail((resp) => {})
                .always((resp) => {});
            }
        })(ComboForm);
    }

    componentDidMount() {
        Store.team.subscribe(this.getBalance);
        this.updateTimes = 0;
    }

    componentWillUnmount() {
        Store.team.unsubscribe(this.getBalance);
    }

    getBalance = (e) => {
        const balance = e.data.data.balance;
        this.setState({
            balance: balance
        });
    }

    payFromBalanceChange = (value) => {
        this.setState({
            payFromBalance: value,
            useBalance: !!value
        });
    }

    onUseBalanceCheckboxChange = (e) => {
        if (!e.target.checked) {
            this.payFromBalanceChange(0);
        } else {
            const balance = parseFloat(this.state.balance);
            const costs = this.refs.currentSetting ? this.refs.currentSetting.state.costs : 0;
            const maxPayFromBalance = parseFloat(costs >= balance ? balance : costs);
            this.payFromBalanceChange(maxPayFromBalance);
        }
    }

    changeStep = (current) => {
        this.setState({
            currentStep: current
        });
    }

    confirmPay = (money, comboSetting) => {
        const me = this;
        if (!comboSetting) {
            comboSetting = this.props.currentCombo;
        }
        if (money) {
            window.open(`/api/account/pay/to?money=${ money }&type=alipay&method=plan&plan_id=${ comboSetting.plan_id }&year=${ comboSetting.year }&agent_num=${ comboSetting.agent_num }`);
            Confirm({
                title: '您是否已经支付成功',
                okText: '已经支付成功',
                cancelText: '我需要重新支付',
                maskClosable: false,
                onOk() {
                    // me.postComboSetting(comboSetting);
                    Store.account.plan0.reload();
                    Store.setting.base.reload();
                    me.changeStep(0);
                },
                onCancel() {}
            });
        } else {
            me.postComboSetting(comboSetting);
        }
    }

    postComboSetting = (comboSetting) => {

        // comboSetting.method = 'plan';
        Reqwest({
            url: '/api/account/plan',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(comboSetting)
        })
        .then((resp) => {
            if (resp.success) {
                Store.account.plan0.reload();
                Store.setting.base.reload();
                this.changeStep(0);
                this.refs.currentSetting.setState({
                    costs: '0.00'
                });
                Message.success('套餐购买成功。');
            } else {
                Message.error('余额不足，支付失败。');
            }
        })
        .fail((resp) => {
            Message.error('服务器错误，支付失败。');
        })
        .always((resp) => {});
    }

    render() {
        const currentCombo = this.props.currentCombo;
        const combos = this.props.combos;

        const balance = parseFloat(this.state.balance);
        const costs = this.refs.currentSetting ? this.refs.currentSetting.state.costs : 0;
        const maxPayFromBalance = parseFloat(costs >= balance ? balance : costs);
        const payFromBalance = 'object' === typeof(this.state.payFromBalance) ? maxPayFromBalance : parseFloat(this.state.payFromBalance);
        const alipay = costs - payFromBalance > 0 ? (costs - payFromBalance).toFixed(2) : 0;

        const columns = [
            { title: '套餐类型', dataIndex: 'name', key: 'name' },
            { title: '套餐价格', dataIndex: 'price', key: 'price', render: (text) => { return (<div><span>￥</span><span className="price" style={{ fontSize: 14 }}>{ text }</span></div>); } },
            { title: '坐席数', dataIndex: 'agent_num', key: 'agent_num' },
            { title: '到期时间', dataIndex: 'year', key: 'year', render: (text) => { return (<span>{ `${text}年${parseInt(currentCombo.end_at.substr(5, 2))}月${parseInt(currentCombo.end_at.substr(8, 2))}日` }</span>); } },
            { title: '费用', dataIndex: 'costs', key: 'costs', render: (text) => { return (<div><span>￥</span><span className="price">{ text }</span></div>); }  }
        ];
        const dataSource = this.state.comboSetting || currentCombo.plan_id ? [this.state.comboSetting || currentCombo] : [];
        if (dataSource[0]) {
            dataSource[0].costs = costs;
        }

        return (
            <Card title='购买套餐' style={{ marginTop: 20 }}>
                <Steps size="small" current={ this.state.currentStep } style={{ marginBottom: 30 }}>
                    <Step key={ 1 } title="设置套餐" />
                    <Step key={ 2 } title="确认套餐" />
                    <Step key={ 3 } title="支付" />
                </Steps>

                <div>
                    <div className="combo-setting" style={{ display: 0 === this.state.currentStep ? 'block' : 'none' }}>
                        <ComboForm ref="comboForm" currentCombo={ currentCombo } combos={ combos } />
                        <CurrentSetting ref='currentSetting' comboSetting={ this.state.comboSetting || currentCombo } changeStep={ this.changeStep } />
                    </div>
                    <div style={{ display: 1 === this.state.currentStep ? 'block' : 'none' }}>
                        <Table columns={ columns } dataSource={ dataSource } pagination={ false } rowKey={ record => record.plan_id } />
                        <div style={{ textAlign: 'right', marginTop: 20 }}>
                            <Button type="primary" onClick={ () => this.changeStep(0) }>上一步</Button>
                            <Button onClick={ () => this.changeStep(2) } className="pay-button">去支付</Button>
                        </div>
                    </div>
                    <div style={{ display: 2 === this.state.currentStep ? 'block' : 'none' }} className="combo-step-three-pay">
                        <div className='pay-from-balance pay-div'>
                            <Checkbox checked={ this.state.useBalance } onChange={ this.onUseBalanceCheckboxChange }>现金余额 ¥{ balance }</Checkbox>
                            <div>
                                <span>当前使用 </span>
                                <InputNumber size="small" style={{ width: 100 }} max={ maxPayFromBalance } min={ 0 } value={ payFromBalance } step={ 0.01 } onChange={ this.payFromBalanceChange } />
                                <span> 元</span>
                            </div>
                            <span style={{ color: '#f60' }}>如果您有正在使用中的后付费产品，请保证有足够余额。</span>
                            <div style={{ float: 'right', marginRight: 0 }} className="flex-end-center">
                                <span>支付￥</span><span className="price">{ payFromBalance }</span>
                            </div>
                        </div>
                        <div>
                            <div className='pay-div'>
                                <span>其他支付方式</span>
                                <div style={{ float: 'right' }} className="flex-end-center">
                                    <span>支付￥</span><span className="price">{ alipay }</span>
                                </div>
                            </div>
                            <Radio style={{ display: 'flex', alignItems: 'center', marginLeft: 13 }} defaultChecked={ true } checked={ true }>
                                <img src='/resource/images/alipay.jpg'/>
                            </Radio>
                            <hr />
                            <div style={{ marginTop: 20 }} className="flex-end-center">
                                <div>
                                    <span>一共支付￥</span><span className="price">{ costs }</span>
                                </div>
                                <Button type="primary" onClick={ () => this.changeStep(0) } style={{ marginLeft: 10 }}>取消</Button>
                                <Button onClick={ () => this.confirmPay(alipay, this.state.comboSetting) } className="pay-button">确认支付</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        );
    }
}
