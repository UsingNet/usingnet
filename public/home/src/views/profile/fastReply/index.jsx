import React from 'react';
import Store from 'network/store';
import { Icon, Tabs, Popconfirm, Modal, Form, Input, Message, Button, Table } from 'antd';

import './fastReply.less';

const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const createFrom = Form.create;


class FastReplyForm extends React.Component {

    componentDidMount() {
        this.props.form.setFieldsValue(this.props.formData);
    }

    render() {
        const { getFieldProps } = this.props.form;
        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 18 }
        };


        return (
            <div>
                <Form horizontal form={ this.props.form }>
                    <FormItem
                        { ...formItemLayout }
                        label="快捷词"
                        >
                        <Input
                            { ...getFieldProps('shortcut', {
                                rules: [
                                    { required: true, max: 10, message: '必填，且长度不能大于10个字符' }
                                ]
                            }) }
                            type="text"
                            addonBefore="#"
                            autoComplete="off" />
                    </FormItem>

                    <FormItem
                        { ...formItemLayout }
                        label="详细内容"
                        >
                        <Input
                            { ...getFieldProps('content', {
                                rules: [
                                    { required: true, max: 255, message: '必填，且长度不能大于255个字符' }
                                ]
                            }) }
                            type="text"
                            type="textarea"
                            rows="10"
                            autoComplete="off" />
                    </FormItem>

                </Form>
            </div>
        );
    }
}

FastReplyForm = createFrom({})(FastReplyForm);


export default class FastReply extends React.Component {

    state = {
         personalFastReply: [],
         commonFastReply: [],
         modalTitle: '',
         modalVisible: false,
         activeKey: 'quickReplyPersonal',
         scrollHeight: 0
     };

    componentDidMount() {
         Store.setting.quickReplyPersonal.subscribe(this.onPersonalFastReplyLoaded);
         Store.setting.quickReplyCommon.subscribe(this.onCommonFastReplyLoaded);
         window.addEventListener('resize', this.onWindowResize);
         this.onWindowResize();
     }

     componentWillUnmount() {

         Store.setting.quickReplyPersonal.unsubscribe(this.onPersonalFastReplyLoaded);
         Store.setting.quickReplyCommon.unsubscribe(this.onCommonFastReplyLoaded);
         window.removeEventListener('resize', this.onWindowResize);
     }

     onWindowResize = () => {
         const content = document.querySelector('.ant-layout-content.content');
         if (content) {
             this.setState({
                 scrollHeight: content.offsetHeight - 145
             });

         }

     }

     onPersonalFastReplyLoaded = (e) => {
         const data = e.data.data;

         this.setState({
             personalFastReply: data
         });

     }

     onCommonFastReplyLoaded = (e) => {
         const data = e.data.data;


         this.setState({
             commonFastReply: data
         });

     }

     onDeleteFastReply = (data = {}) => {
         Store.setting.quickReply.remove(data.id).then((resp) => {
             if (resp.success) {
                 Store.setting[this.state.activeKey].reload();
             }
         });
     }

     onWriteFastReply = (data = {}) => {
         let title = "";
         if (data.id) {
             title = '修改快捷回复';
         } else {
             title = '添加快捷回复';
         }

         if (this.refs.fastReplyForm) {
             this.refs.fastReplyForm.setFieldsValue(data);
         }


         this.setState({
             modalTitle: title,
             modalVisible: true,
             formData: data
         });
     }

     onCancelButtonClick = () => {
         this.setState({
             modalVisible: false
         });
     }

     onOkButtonClick = () => {

         if (this.refs.fastReplyForm) {
             this.refs.fastReplyForm.getForm().validateFields((errors, values) => {
                 if (!errors) {
                     const typeMap = {
                         quickReplyPersonal : 'PERSONAL',
                         quickReplyCommon : 'COMMON',
                     };


                     const values = this.refs.fastReplyForm.getForm().getFieldsValue();

                     values.id = this.refs.fastReplyForm.props.formData.id;
                     values.type = typeMap[this.state.activeKey];

                     Store.setting.quickReply.save(values)
                     .then((resp) => {
                         if (resp.success) {
                             this.setState({
                                 modalVisible: false,
                             });
                             Message.success('保存成功！');
                             Store.setting[this.state.activeKey].reload();
                         } else {
                             Message.error(resp.msg);
                         }
                     });
                 }
             });
         }

     }

     onTabChange = (activeKey) => {

         this.setState({
             activeKey: activeKey
         });
     }


    render() {

        const columns = [
            { title: '关键词', dataIndex: 'shortcut', width: '20%', render: (text) => {
                return `# ${ text }`;
            } },
            { title: '详细内容', dataIndex: 'content', width: '70%' },
            { title: '操作', width: '10%', render: (text, record) => (
                <span className="fast-reply-tableAction">
                    <Icon type="edit" onClick={ () => {this.onWriteFastReply(record)} } />
                    <span className="ant-divider"></span>
                    <Popconfirm title="确定要删除这条数据吗？" onConfirm={ () => {this.onDeleteFastReply(record)} }>
                        <Icon type="delete" />
                    </Popconfirm>
                </span>
            ) },
        ];

        return (
            <div className="profile-fastReply">
                 <header>
                     <h4>快捷回复</h4>
                 </header>
                 <Button
                     icon="plus"
                     onClick={ () => {
                         this.onWriteFastReply({shortcut: "", content: ""}, this.state.activeKey)
                     } }>
                     添加快捷回复
                 </Button>
                 <Tabs
                     className="profile-fastReply-tabContent"
                     type="card"
                     size="small"
                     onChange={ this.onTabChange }
                     activeKey={ this.state.activeKey }>
                     <TabPane tab="自定义" key="quickReplyPersonal">
                         <Table
                             size="middle"
                             rowKey={ record => record.id }
                             columns={ columns }
                             pagination={ false }
                             dataSource={ this.state.personalFastReply }
                             scroll={{ y: this.state.scrollHeight }} />
                     </TabPane>
                     <TabPane tab="通用" key="quickReplyCommon">
                         <Table
                             size="middle"
                             rowKey={ record => record.id }
                             columns={ columns }
                             pagination={ false }
                             dataSource={ this.state.commonFastReply }
                             scroll={{ y: this.state.scrollHeight }} />
                     </TabPane>
                 </Tabs>
                 <Modal
                     title={ this.state.modalTitle }
                     visible={ this.state.modalVisible }
                     onCancel={ this.onCancelButtonClick }
                     onOk={ this.onOkButtonClick }
                     okText="提交"
                     maskClosable={ false }>
                     <FastReplyForm
                         formData={ this.state.formData }
                         ref="fastReplyForm" />
                 </Modal>
             </div>
        );
    }
}
