import React from 'react';
import { Steps, Button, Form } from 'antd';
import QueueAnim from 'rc-queue-anim';
import reqwest from 'reqwest';
import apiConfig from 'config';
import config from 'network/store_config';
import Store from 'network/store';
import AccessForm from './accessForm';
import AccessCheckingForm from './accessCheckingForm';
import './phoneAccess.less';

const Step = Steps.Step;
const FormItem = Form.Item;

const steps = [
    { title: '申请', description: '向优信申请开通电话功能；' },
    { title: '审核', description: '优信的员工对您的申请进行细致的审核；' },
    { title: '绑定自定义号码（可选）', description: '申请审核成功，您可以绑定您的自定义号码；' },
    { title: '接入成功', description: '电话已经处于接入状态。' },
].map((s, i) => <Step key={i} title={s.title} description={s.description} />);

class PhoneAccess extends React.Component {

    state = {
        currentStep: 100,
        voip: {},
        showEditorForm: true,
    };

    componentDidMount() {
        Store.setting.voip.subscribe(this.onVoipLoaded);

        reqwest({
            url: apiConfig.api + config.setting.base.url,
        }).then(resp => {
            if (resp.code === 408 || resp.code === 409) {
                location.href = apiConfig.login;
            }

            if (resp.success) {
                this.setState({
                    voipPrice: resp.data.price.voip,
                });
            }
        });
        // Store.setting.base.subscribe(this.onBaseLoaded);
    }

    componentWillUnmount() {
        Store.setting.voip.unsubscribe(this.onVoipLoaded);
        // Store.setting.base.unsubscribe(this.onBaseLoaded);
    }

    onVoipLoaded = (e) => {
        const data = e.data.data;
        const voipStatus = data.status;
        const displayNumberStatus = data.display_number_status;
        this.setState({
            voip: data,
        });

        switch (voipStatus) {
        case 'INIT':
            this.setState({ currentStep: 0 });
            break;
        case 'CHECKING':
            this.setState({ currentStep: 1 });
            break;
        case 'SUCCESS':
            this.setState({ currentStep: 3 });
            break;
        default:
            break;
        }

        switch (displayNumberStatus) {
        case 'CHECKING':
            this.setState({
                showEditorForm: false,
            });
            break;
        default:
            break;
        }
    }

    // onBaseLoaded = (e) => {
    //     const data = e.data.data;
    //     this.setState({
    //         voipPrice: data.price.voip,
    //     });
    // }

    backToEdit = () => {
        this.setState({
            showEditorForm: true,
        });
    }

    backToLastStep = () => {
        this.setState({
            currentStep: 2,
        });
    }

    jumpToTheLastStep = () => {
        this.setState({
            currentStep: 3,
            showEditorForm: !(this.state.voip.display_number_status === 'CHECKING'),
        });
    }

    applyForVoip = () => {
        Store.setting.voip.save({ status: 'CHECKING' });
    }

    render() {
        const currentStep = this.state.currentStep;

        const formItemLayout = {
            labelCol: { span: 12 },
            wrapperCol: { span: 12 },
        };

        const step1 = (
            <div key="step1">
                <ul style={{ listStyle: 'inherit', marginLeft: 15 }}>
                    <li>专业版及其以上套餐方可开通电话功能，如权限不足，请升级您的套餐；</li>
                    <li>接入电话功能后该功能不能关闭；</li>
                    <li>电话功能是优信提供的后付费功能，资费为：{this.state.voipPrice}元/分钟。</li>
                </ul>
                <Button
                    type="primary"
                    size="large"
                    style={{ marginTop: 20, marginLeft: 15 }}
                    onClick={this.applyForVoip}
                >
                    申请开通电话功能
                </Button>
            </div>
        );

        const step2 = (
            <div key="step2">
                <Button
                    type="primary"
                    loading
                >
                    正在审核中，请耐心等候
                </Button>
            </div>
        );

        const step3 = (
            <div
                key="step3"
                style={{ display: this.state.showEditorForm ? 'block' : 'none' }}
            >
                <AccessForm
                    voip={this.state.voip}
                    jumpToTheLastStep={() => this.jumpToTheLastStep()}
                />
            </div>
        );

        const step4 = (
            <div key="step4" style={{ display: !this.state.showEditorForm ? 'block' : 'none' }}>
                <AccessCheckingForm
                    voip={this.state.voip}
                    backToEdit={() => { this.backToEdit(); }}
                    jumpToTheLastStep={() => this.jumpToTheLastStep()}
                />
            </div>
        );

        const step5 = (
            <div key="step5">
                <h1>电话接入成功！</h1>
                <Form horizontal>
                    <FormItem { ...formItemLayout } label="申请的虚拟号码：">
                        <span className="phone-number">{this.state.voip.number}</span>
                    </FormItem>
                    <FormItem { ...formItemLayout } label="绑定的固话号码：">
                        <span
                            className="phone-number"
                        >
                          {
                              this.state.voip.display_number_status === 'CHECKING'
                                  ?
                                  '审核中'
                                  : (this.state.voip.display_number || '未绑定')
                          }
                        </span>
                    </FormItem>
                    <FormItem {...formItemLayout} label="语音电话资费">
                        <span>{`${this.state.voipPrice}元/分钟`}</span>
                    </FormItem>
                </Form>
                <Button
                    type="primary"
                    className="back-to-setting-number-btn"
                    onClick={this.backToLastStep}
                >
                    返回设置自定义绑定号码
                </Button>
            </div>
        );

        const contentList = [step1, step2, [step3, step4], step5];


        return (
            <div className="setting-phone-access">
                <Steps current={currentStep} size="small">
                    {steps}
                </Steps>
                <div className="setting-phone-access-body">
                    <QueueAnim>
                        {contentList[currentStep]}
                    </QueueAnim>
                </div>
            </div>
        );
    }
}

export default PhoneAccess;
