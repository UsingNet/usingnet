import React from 'react';
import Echarts from 'echarts';
import { Card } from 'antd';

export default class HistogramNative extends React.Component {

    render() {
        const data = this.props.data || { xAxis: [], yAxis: [] };

        const chartsId = this.props.chartsId;

        const dom = document.querySelector(`#${chartsId}`);

        const option = {
            title: {
                text: data.title,
                textStyle: {
                    fontWeight: 'normal'
                }
            },
            tooltip : {
                trigger: 'axis',
                axisPointer : {
                    type : 'shadow'
                }
            },
            legend: {
                data: data.legend
            },
            grid: {
                left: 20,
                right: 20,
                bottom: 20,
                containLabel: true,
            },
            xAxis:  {
                type: 'category',
                data: data.xAxis
            },
            yAxis: {
                type: 'value',
                minInterval: 1,
                splitNumber: 6,
                axisLine: {
                    show: false
                }
            },
            series: data.yAxis.map((e, i) => {
                return {
                    name: data.legend[i],
                    type: 'bar',
                    stack: '总量',
                    itemStyle: {
                        normal: {
                            color: data.color[i]
                        }
                    },
                    data: e
                };
            })
        };


        if (dom && data.title) {
            const echartsInstance = Echarts.init(dom);
            echartsInstance.setOption(option);
        }


        return (
            <Card className={ `sub-item ${ data.className }` }>
                <div id={ chartsId } style={{ height: 400 }}></div>
            </Card>
        );
    }
}
