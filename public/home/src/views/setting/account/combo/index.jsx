import React from 'react';
import Store from 'network/store';
import CurrentCombo from './currentCombo';
import SettingCombo from './settingCombo';
import Moment from 'moment';
import Reqwest from 'reqwest';

export default class Combo extends React.Component {
    state = {
        currentCombo: {},
        combos: [],
    };

    componentDidMount() {
        Store.account.plan0.subscribe(this.currentComboLoadedCallback);
        Store.account.plan.subscribe(this.combosLoadedCallback);
    }

    componentWillUnmount() {
        Store.account.plan0.unsubscribe(this.currentComboLoadedCallback);
        Store.account.plan.unsubscribe(this.combosLoadedCallback);
    }

    currentComboLoadedCallback = (e) => {
        const data = e.data.data;

        this.setState({
            currentCombo: data,
        });
    }

    combosLoadedCallback = (e) => {
        const data = e.data.data;
        this.setState({
            combos: data,
        });
    }

    render() {
        const currentCombo = this.state.currentCombo;
        const combos = this.state.combos;

        const comboIds = combos.map((item) => {
            return item.id;
        });

        let settingCombo = null;

        if (comboIds.indexOf(currentCombo.plan_id) === -1 && combos[0]) {
            settingCombo = combos[0];
            settingCombo.plan_id = settingCombo.id;
            settingCombo.agent_num = 1;
            settingCombo.end_at = Moment().add(1, 'y').format('YYYY-MM-DD HH:mm:ss');
            settingCombo.year = settingCombo.end_at.substr(0, 4);

            Reqwest({
                url: '/api/account/plan/balance',
                data: {
                    plan_id: settingCombo.plan_id,
                    agent_num: 1,
                    year: settingCombo.end_at.substr(0, 4)
                }
            })
            .then((resp) => {
                if (resp.success) {
                    if (this.refs.settingCombo && this.refs.settingCombo.refs.currentSetting) {
                        this.refs.settingCombo.refs.currentSetting.setState({
                            costs: resp.costs
                        });
                    }
                }
            })
            .fail((resp) => {})
            .always((resp) => {});

        }


        return (
            <div style={{ overflowY: 'auto', height: '100%' }}>
                <CurrentCombo currentCombo={ currentCombo } />
                <SettingCombo currentCombo={ settingCombo || currentCombo } combos={ combos } ref='settingCombo' />
            </div>
        );
    }
}
