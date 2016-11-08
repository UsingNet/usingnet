import React, { PropTypes } from 'react';
import { Button, DatePicker } from 'antd';
const ButtonGroup = Button.Group;
const RangePicker = DatePicker.RangePicker;

export default class DateFilter extends React.Component {
    state = {
        selectedBtnKey: 1,
        rangePickerValue: null,
        divClassName: 'date-filter',
    };

    onChange = (value, dateString) => {
        if (dateString[0]) {
            this.setState({
                selectedBtnKey: 0,
                rangePickerValue: value,
                divClassName: 'date-filter range-picker-valid',
            });
            this.props.onQueryParamsChange(dateString);
        } else {
            this.onButtonClick(1);
        }
    }

    onButtonClick = (btnKey) => {
        let begin = '';
        const date = new Date();
        date.setDate(date.getDate());
        const end = date.toISOString().substr(0, 10);
        const map = {
            1: 0,
            2: 7,
            3: 30,
        };

        if (btnKey === 4) {
            begin = new Date(0).toISOString().substr(0, 10);
        } else {
            date.setDate(date.getDate() - map[btnKey]);
            begin = date.toISOString().substr(0, 10);
        }

        this.setState({
            selectedBtnKey: btnKey,
            rangePickerValue: null,
            divClassName: 'date-filter',
        });
        this.props.onQueryParamsChange([begin, end]);
    }

    render() {
        return (
            <div className={this.state.divClassName}>
                <ButtonGroup>
                    <Button
                        type={this.state.selectedBtnKey === 1 ? 'primary' : 'ghost'}
                        onClick={() => this.onButtonClick(1)}
                    >
                    今天
                    </Button>

                    <Button
                        type={this.state.selectedBtnKey === 2 ? 'primary' : 'ghost'}
                        onClick={() => this.onButtonClick(2)}
                    >
                    最近7天
                    </Button>

                    <Button
                        type={this.state.selectedBtnKey === 3 ? 'primary' : 'ghost'}
                        onClick={() => this.onButtonClick(3)}
                    >
                    最近30天
                    </Button>

                    <Button
                        type={this.state.selectedBtnKey === 4 ? 'primary' : 'ghost'}
                        onClick={() => this.onButtonClick(4)}
                    >
                    全部
                    </Button>
                </ButtonGroup>
                <RangePicker
                    style={{ width: 184 }}
                    onChange={this.onChange}
                    value={this.state.rangePickerValue}
                />
            </div>
        );
    }
}

DateFilter.propTypes = {
    onQueryParamsChange: PropTypes.func,
};
