import React from 'react';
import { Card } from 'antd';

export default class CurrentCombo extends React.Component {
    render() {
        const currentCombo = this.props.currentCombo;
        let endAt = '';

        if (currentCombo.plan && 'experience' === currentCombo.plan.slug) {
            endAt = '无限期体验';
        } else if (currentCombo.plan && 'experience' !== currentCombo.plan.slug) {
            endAt = currentCombo.end_at.substr(0, 10);
        }

        const color = (currentCombo.plan && 'experience' !== currentCombo.plan.slug && currentCombo.plan.color) || '#666';
        return (
            <Card title="当前套餐" bodyStyle={{ display: 'flex', justifyContent: 'space-between' }} className="current-combo-card">
                <big style={{ color: color }}>{ currentCombo.name }</big>
                <span><big style={{ color: color }}>{ currentCombo.agent_num }</big>个坐席</span>
                <span>到期时间：<big style={{ color: color }}>{ endAt }</big></span>
            </Card>
        );
    }
}
