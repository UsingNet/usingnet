import React, { PropTypes } from 'react';
import { Row, Col, Modal, Form, Input, Select, Button, Icon } from 'antd';

const FormItem = Form.Item;
const Option = Select.Option;

class OrderForm extends React.Component {
    render() {
        const { getFieldProps } = this.props.form;

        let orderInputItem = '';
        if (this.props.orderFormData.items) {
            orderInputItem = this.props.orderFormData.items.map((item, index) => (
                <FormItem
                    key={index}
                    wrapperCol={{ span: 24 }}
                >
                    <Row gutter={10}>
                        <Col span={4}>
                            <Select
                                value={item.type}
                                onChange={
                                    (value) => this.props.changeOrderItemType(value, index)
                                }
                            >
                                <Option value="input">单行输入框</Option>
                                <Option value="textarea">多行行输入框</Option>
                            </Select>
                        </Col>
                        <Col span={17}>
                            <Input
                                value={item.placeholder}
                                type="text"
                                placeholder="提示语"
                                onChange={
                                    (event) => this.props.updateOrderFormItemValue(event, index)
                                }
                            />
                        </Col>
                        <Col span={1} onClick={() => this.props.upOrderFormItem(index)}>
                            <Icon type="up" />
                        </Col>
                        <Col span={1} onClick={() => this.props.downOrderFormItem(index)}>
                            <Icon type="down" />
                        </Col>
                        <Col span={1} onClick={() => this.props.removeOrderFormItem(index)}>
                            <Icon type="cross" />
                        </Col>
                    </Row>
                </FormItem>
            ));
        }

        return (
            <Modal
                title="编辑表单"
                visible={this.props.formEditVisible}
                onOk={this.props.completeEditOrderForm}
                onCancel={this.props.cancelEditOrderForm}
            >
                <Row className="change-item-type">
                    <Col span={10}>
                        <Button
                            type="primary"
                            size="small"
                            onClick={this.props.addOrderFormItem}
                        >
                            添加
                        </Button>
                    </Col>
                </Row>

                <Form horizontal form={this.props.form}>
                    <h4>标题</h4>
                    <FormItem
                        wrapperCol={{ span: 24 }}
                    >
                        <Input
                            {...getFieldProps('title')}
                            type="text"
                            placeholder="标题"
                        />
                    </FormItem>

                    <h4>输入框</h4>
                    {orderInputItem}
                </Form>
            </Modal>
        );
    }
}

OrderForm.propTypes = {
    formEditVisible: PropTypes.bool,
    orderFormData: PropTypes.object,
    orderForm: PropTypes.object,
    form: PropTypes.object,
    changeOrderItemType: PropTypes.func,
    addOrderFormItem: PropTypes.func,
    cancelEditOrderForm: PropTypes.func.isRequired,
    updateOrderFormItemValue: PropTypes.func.isRequired,
    upOrderFormItem: PropTypes.func.isRequired,
    downOrderFormItem: PropTypes.func.isRequired,
    removeOrderFormItem: PropTypes.func.isRequired,
    completeEditOrderForm: PropTypes.func.isRequired,
};

function mapPropsToFields(props) {
    return {
        title: {
            value: props.orderFormData.title,
        },
    };
}

function onFieldsChange(props, fields) {
    props.updateOrderForm(fields);
}

const Order = Form.create({
    mapPropsToFields,
    onFieldsChange,
})(OrderForm);
export default Order;
