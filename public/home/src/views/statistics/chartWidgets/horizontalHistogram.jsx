import React from 'react';
import Echarts from 'echarts';
import { Card, Icon } from 'antd';

export default class HorizontalHistogram extends React.Component {

    render() {
        const data = this.props.data || { yAxis: [] };

        const chartsId = this.props.chartsId;

        const dom = document.querySelector(`#${chartsId}`);

        let isNull = false;

        let j = 0;
        if (data.percent) {
            for (let i = 0; i < data.percent.length; i++) {
                j += parseFloat(data.percent[i]);
            }
        }

        if (!j) {
            isNull = true;
        }


        const option = {
            grid: {
                left: 60,
                right: 40,
                bottom: 5,
                top: 0,
            },
            xAxis:  {
                type: 'value',
                min: 0,
                max: 100,
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    show: false
                },
                splitLine: {
                    show: false
                }
            },
            yAxis: {
                type: 'category',
                splitLine: {
                    show: true
                },
                axisLine: {
                    show: false
                },
                data: data.yAxis
            },
            series: [{
                name: '占比',
                type: 'bar',
                label: {
                    normal: {
                        show: true,
                        position: 'right',
                        formatter: '{c}%',
                        textStyle: {
                            color: '#000'
                        }
                    }
                },
                itemStyle: {
                    normal: {
                        color: data.color
                    }
                },
                data: data.percent
            }]
        };

        if (dom && !isNull) {
            const echartsInstance = Echarts.init(dom);
            echartsInstance.setOption(option);
        }

        return (
            <Card>

                <div style={{ opacity: `${ isNull ? 1 : 0 }`, display: 'flex', height: 120, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon type="frown" /><span>暂无数据</span>
                </div>

                <div id={ chartsId } style={{ position: 'absolute', top: 24, left: 24, right: 24, zIndex: 9999, height: 120, opacity: `${ isNull ? 0 : 1 }` }}></div>
            </Card>
        );
    }
}
