import React from 'react';
import reqwest from 'reqwest';
import { Checkbox, Button, message } from 'antd';
import Store from 'network/store';

const CheckboxGroup = Checkbox.Group;

class Permission extends React.Component {
    state = {
        permissions: [],
        checked: [],
    }

    componentDidMount() {
        Store.permission.subscribe(this.onPermissionsGet);
    }

    componentWillUnmount() {
        Store.permission.unsubscribe(this.onPermissionsGet);
    }

    onPermissionsGet = (e) => {
        this.setState({
            permissions: e.data.data,
        });
    }

    onPermissionChange = (e, p) => {
        if (e.target.checked) {
            p.used = true;
        } else {
            p.used = false;
        }

        this.setState({
            permissions: this.state.permissions,
        });
    }

    onSubmit = () => {
        const checked = [];
        const checkedPermission = this.state.permissions.filter(p => p.used);

        for (const c of checkedPermission) {
            checked.push(c.id);
        }

        reqwest({
            url: '/api/permission',
            method: 'POST',
            data: {
                ids: checked,
            },
        }).then(resp => {
            if (!resp.success) {
                message.error(resp.msg);
            } else {
                message.info('保存成功');
            }
        });
    }

    render() {
        const checkboxNode = this.state.permissions.map(p => (
            <Checkbox
                key={p.id}
                checked={p.used}
                onChange={(event) => this.onPermissionChange(event, p)}
            >
                {p.name}
            </Checkbox>
        ));
        return (
            <div className="permission">
                <h3>客服权限</h3>
                <h5 className="help">勾选客服可见的菜单</h5>
                {checkboxNode}
                <div>
                    <Button type="primary" className="submit" onClick={this.onSubmit}>提交</Button>
                </div>

            </div>
        );
    }
}

export default Permission;
