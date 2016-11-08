import React from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'antd';
import ContactTable from './contactTable';
import SearchInput from './searchInput';
import FormDialog from './formDialog';
import Store from 'network/store';
import ReloadTable from 'views/components/ReloadTable';

export default class Contact extends React.Component {

    onAddButtonClick = () => {
        const container = document.createElement('div');
        const propsConfig = {
            title: '添加联系人',
            src: '//o1hpnn7d6.qnssl.com/default-avatar.png-avatar',
            formData: {},
        };
        document.body.appendChild(container);
        const destroyContainer = function () {
            setTimeout(() => {
                document.body.removeChild(container.nextElementSibling);
                document.body.removeChild(container);
            }, 1000);
        };
        ReactDOM.render(<FormDialog { ...propsConfig } onDestroy={ destroyContainer } onSuccess={ this.requestData } />, container);
    }

    onSearch = (text) => {
        var contactTable = this.refs.contactTable;
        contactTable.queryParams ? '' : contactTable.queryParams = {};
        contactTable.queryParams.query = text;
        contactTable.queryParams.page = 1;
        this.requestData(contactTable.queryParams);
    }

    requestData = (params) => {
        Store.contact.load(params);
    }

    render() {
        return (
            <div style={{ padding: 20, height: '100%', fontSize: 14 }}>
                <div className="table-operation-region">
                    <SearchInput style={{ width: 180 }} placeholder="输入搜索内容" onSearch={ text => { this.onSearch(text); } } />
                    <Button icon="plus" onClick={ this.onAddButtonClick }>添加联系人</Button>
                    <ReloadTable reload={() => this.requestData(this.refs.contactTable.queryParams)} />
                </div>
                <ContactTable
                    requestData={this.requestData}
                    formDialog={ this.refs.formDialog }
                    ref="contactTable"
                />
            </div>
        );
    }
}
