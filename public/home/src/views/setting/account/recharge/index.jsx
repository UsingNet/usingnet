import React from 'react';
import { Card, Form, InputNumber, Radio, Button, Row, Col, Modal } from 'antd';
import Store from 'network/store';

const FormItem = Form.Item;
const createFrom = Form.create;
const Confirm = Modal.confirm;

class RechargeForm extends React.Component {
    state = {
        balance: 0,
        rechargeMoney: 0,
        disabledBtn: true
    };

    componentDidMount() {
        Store.team.subscribe(this.baseLoadedCallback);
    }

    componentWillUnmount() {
        Store.team.unsubscribe(this.baseLoadedCallback);
    }

    baseLoadedCallback = (e) => {
        const balance = e.data.data.balance;
        this.setState({
            balance: balance
        });
    }

    rechargeMoneyChange = (value) => {
        this.setState({
            rechargeMoney: value,
            disabledBtn: value ? false : true
        });
    }

    onRechargeButtonClick = () => {
        const me = this;
        const money = me.state.rechargeMoney;
        if (money) {
            window.open('/api/account/pay/to?money=' + money + '&type=alipay');
            Confirm({
                title: '您是否已经支付成功',
                okText: '已经支付成功',
                cancelText: '我需要重新支付',
                maskClosable: false,
                onOk() {
                    Store.setting.base.reload();
                    me.setState({
                        rechargeMoney: 0,
                        disabledBtn: true
                    });
                },
                onCancel() {}
            });
        }
    }

    render() {
        const { getFieldProps } = this.props.form;
        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 21 }
        };

        return (
            <div>
                <Form horizontal ref="rechargeForm">
                    <FormItem  { ...formItemLayout } label="当前余额：">
                        <span className="ant-form-text" style={{ color: '#f60', fontWeight: 'bold', fontSize: '18px' }}>{ this.state.balance }</span>元
                    </FormItem>
                    <FormItem  { ...formItemLayout } label="充值金额：">
                        <InputNumber min={ 0 } step={ 0.01 } style={{ width: 150 }} { ...getFieldProps('money', {}) } value={ this.state.rechargeMoney } onChange={ this.rechargeMoneyChange } />
                        <span className="ant-form-text">元</span>
                    </FormItem>
                    <FormItem  { ...formItemLayout } label="充值方式：" style={{ display: 'flex', alignItems: 'center' }}>
                        <Radio style={{ display: 'flex', alignItems: 'center' }} checked={ true }>
                            <img src='/resource/images/alipay.jpg'/>
                        </Radio>
                    </FormItem>
                    <FormItem>
                        <Row>
                          <Col span={ 3 }></Col>
                          <Col span={ 21 }>
                              <Button className={ this.state.disabledBtn ? '' : "pay-style-button" } onClick={ () => this.onRechargeButtonClick() } disabled={ this.state.disabledBtn }>去支付</Button>
                          </Col>
                        </Row>
                    </FormItem>
                </Form>
            </div>
        );
    }
}

export default class Recharge extends React.Component {
    componentWillMount() {
        RechargeForm = createFrom({})(RechargeForm);
    }

    render() {
        return (
            <Card title="充值">
                <RechargeForm />
            </Card>
        );
    }
}
