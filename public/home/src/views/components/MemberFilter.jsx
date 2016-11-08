import React, { PropTypes } from 'react';
import { Select } from 'antd';

const Option = Select.Option;

export default class MemberFilter extends React.Component {
    render() {
        const memberNode = this.props.members.map((member) => (
            <Option key={member.id} value={member.id}>
                {member.name}
            </Option>
        ));

        return (
            <div className="member-select">
                <Select
                    defaultValue="0"
                    style={{ width: 120 }}
                    onChange={this.props.onMemberChange}
                >
                    <Option value="0">全部客服</Option>
                    {memberNode}
                </Select>
            </div>
        );
    }
}

MemberFilter.propTypes = {
    members: PropTypes.array,
    onMemberChange: PropTypes.func,
};
