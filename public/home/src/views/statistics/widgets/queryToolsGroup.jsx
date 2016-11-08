import React from 'react';
import { Button, DatePicker } from 'antd';
import ReloadTable from 'views/components/ReloadTable';
import Moment from 'moment';
const ButtonGroup = Button.Group;
const RangePicker = DatePicker.RangePicker;

export default class QueryToolsGroup extends React.Component {
    state = {
        selectedBtnKey: 1,
        rangePickerValue: null,
        divClassName: 'table-operation-region',
    };

    onChange = (value, dateString) => {
        if (dateString[0]) {
            this.setState({
                selectedBtnKey: 0,
                rangePickerValue: value,
                divClassName: 'table-operation-region range-picker-valid',
            });
            this.props.onQueryParamsChange(dateString);
        } else {
            this.onButtonClick(1);
        }
    }

    onButtonClick = (btnKey) => {
        const end = Moment().format('YYYY-MM-DD');
        const map = {
            '1': 0,
            '2': 7,
            '3': 30,
            '4': 10000
        };
        const begin = Moment().subtract('days', map[btnKey]).format('YYYY-MM-DD');
        this.setState({
            selectedBtnKey: btnKey,
            rangePickerValue: null,
            divClassName: 'table-operation-region',
        });
        this.props.onQueryParamsChange([begin, end]);
    }

    render() {
        return (
            <div className={ this.state.divClassName }>
                <ButtonGroup>
                    <Button type={ 1 === this.state.selectedBtnKey ? 'primary' : 'ghost' } onClick={ () => { this.onButtonClick(1); } }>今天</Button>
                    <Button type={ 2 === this.state.selectedBtnKey ? 'primary' : 'ghost' } onClick={ () => { this.onButtonClick(2); } }>最近7天</Button>
                    <Button type={ 3 === this.state.selectedBtnKey ? 'primary' : 'ghost' } onClick={ () => { this.onButtonClick(3); } }>最近30天</Button>
                    <Button type={ 4 === this.state.selectedBtnKey ? 'primary' : 'ghost' } onClick={ () => { this.onButtonClick(4); } }>全部</Button>
                </ButtonGroup>
                <RangePicker style={{ width: 184 }} onChange={ this.onChange } value={ this.state.rangePickerValue } />
                <ReloadTable reload={this.props.reload} />
            </div>
        );
    }
}
