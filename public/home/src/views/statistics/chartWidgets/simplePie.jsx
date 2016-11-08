import React from 'react';
import Echarts from 'echarts';
import { Card, Icon } from 'antd';

export default class SimplePie extends React.Component {

    render() {
        const data = this.props.data || { legend: [], data: [] };

        const chartsId = this.props.chartsId;

        const dom = document.querySelector(`#${chartsId}`);

        let isNull = false;

        if (!data.data.length) {
            isNull = true;
        }
        let j = 0;
        for (let i = 0; i < data.data.length; i++) {
            j += parseFloat(data.data[i].value);
        }
        if (!j) {
            isNull = true;
        }


        const option = {
            legend: {
                y: 'center',
                right: '10%',
                width: '50%',
                height: '80%',
                orient: 'vertical',
                data: data.legend
            },
            series : {
                type:'pie',
                radius : [20, '65%'],
                center : ['30%', '50%'],
                roseType : 'radius',
                label: {
                    normal: {
                        show: true,
                        formatter: '{b}：{c}个，占{d}%'
                    },
                    emphasis: {
                        show: true,
                        formatter: '{b}：{c}个，占{d}%'
                    }
                },
                labelLine: {
                    normal: {
                        show: true,
                        length: 5,
                        length2: 5,
                        smooth: false
                    }
                },
                data: data.data
            }
        };

        if (dom && !isNull) {
            const echartsInstance = Echarts.init(dom);
            echartsInstance.setOption(option);
        }

        return (
            <Card>
                <div style={{ opacity: `${ isNull ? 1 : 0 }`, display: 'flex', height: 220, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon type="frown" /><span>暂无数据</span>
                </div>
                <div id={ chartsId } style={{ position: 'absolute', top: 24, left: 24, right: 24, zIndex: 9999, height: 220, opacity: `${ isNull ? 0 : 1 }` }}></div>
            </Card>
        );
    }
}
