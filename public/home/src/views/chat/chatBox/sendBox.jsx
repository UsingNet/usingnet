import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import reqwest from 'reqwest';
import classNames from 'classnames';
import { Popover, Popconfirm, Select, Upload, Icon, message, Tabs, Input, Button } from 'antd';
import { Link } from 'react-router';
import { Face } from 'modules/face';
import voip from 'modules/voip';
import store from 'network/store';
import CutScreen from 'modules/cutScreen';

const TabPane = Tabs.TabPane;

export default class SendBox extends React.Component
{
    state = {
        defaultMessage: '',
        timing: '00:00:00',
        timer: null,
        typeToText: {
            IM: '消息',
            WECHAT: '微信',
            VOIP: '电话',
        },
        personals: [],
        commons: [],
        order: {
            contact: {},
            type: this.props.order.type,
        },
        faceVisible: false,
        replyVisible: false,
        previewVisible: false,
        toolsVisible: true,
        previewUrl: '',
        emailTitle: '',
        fastReplyPanelVisible: false,
        initScreenModalVisible: false,
        imgSrcBlob: null,
        step: 1,
        appsVisible: false,
        apps: [],
        smsTemplateList: []
    };

    componentDidMount() {
        if (this.props.order.type === 'IM') {
            ReactDOM.findDOMNode(this.refs.sendBox).focus();
        }

        if (this.props.voipStatus === 'inbound') {
            this.onAnswer();
        }

        if (!this.props.order.defaultMessage) {
            this.props.order.defaultMessage = '';
        }

        store.appstore.current.subscribe(this.onAppsGet);
        store.setting.quickReplyCommon.subscribe(this.quickReply);
        store.setting.quickReplyPersonal.subscribe(this.quickReply);
        store.sms.template.subscribe(this.onSmsTemplateLoaded, false);
        store.sms.signature.subscribe(this.onSmsSignatureLoaded);
        store.sms.template.load({ status: 'SUCCESS' });

        store.order.all.subscribe(this.props.order.id, this.order);
        document.getElementById('view').onclick = () => {
            if (this.state.faceVisible) {
                this.setState({
                    faceVisible: false,
                });
            }
            if (this.state.replyVisible) {
                this.setState({
                    replyVisible: false,
                });
            }
        };
    }

    componentWillUnmount() {
        store.appstore.current.unsubscribe(this.onAppsGet);
        store.setting.quickReplyCommon.unsubscribe(this.quickReply);
        store.setting.quickReplyPersonal.unsubscribe(this.quickReply);
        store.sms.template.unsubscribe(this.onSmsTemplateLoaded);
        store.sms.signature.unsubscribe(this.onSmsSignatureLoaded);
        store.order.all.unsubscribe(this.props.order.id, this.order);
        if (this.props.order.timer) {
            clearInterval(this.props.order.timer);
        }
        document.getElementById('view').onclick = null;
    }

    onSmsTemplateLoaded = (e) => {
        const data = e.data.data;
        this.setState({
            smsTemplateList: data
        });
    }

    onSmsSignatureLoaded = (e) => {
        const data = e.data.data;
        this.setState({
            smsSignature: data.signature
        });
    }

    onCall = () => {
        if (this.props.voipStatus !== 'connected') {
            message.error('电话未准备就绪, 请稍后');
            return;
        }
        this.getTiming();
        voip.call(this.props.order.contact.phone);
    };

    onHangup = () => {
        if (this.props.order.timer) {
            clearInterval(this.props.order.timer);
        }
        voip.hangup();
    };

    onAnswer = () => {
        this.getTiming();
        voip.answer();
    };

    onChange = (type) => {
        const order = this.props.order;
        store.order.all.save({
            id: order.id,
            type: type
        }).then(resp => this.props.updateOrder(resp.data))
    };

    onInput = (e, type) => {

        let text = e.target.value;
        this.props.order.defaultMessage = text;
        this.setState({
            defaultMessage: text
        });


        if (text && (type !== 'MAIL' || type !== 'NOTE')) {
            this.allFastReply = this.state.commons.concat(this.state.personals);

            let matchFastReply = [];

            if ('#' === text) {
                matchFastReply = this.allFastReply;
            } else {
                matchFastReply = this.allFastReply.filter((e, i) => {
                    // return e.shortcut.match(text) || e.content.match(text);
                    if ('#' === text[0]) {
                        text = text.substr(1);
                    }

                    return text && (e.shortcut.indexOf(text) > -1 || e.content.indexOf(text) > -1);
                });
                matchFastReply = matchFastReply.map((e, i) => {
                    const shortcut = e.shortcut.replace(text, `<i>${text}</i>`);
                    const content = e.content.replace(text, `<i>${text}</i>`);
                    return {
                        shortcut: shortcut,
                        content: content
                    }
                });
            }

            if (matchFastReply.length) {
                const fastReply = matchFastReply.map((e, i) => {
                    return (
                        <li key={ i } onClick={ (event) => {this.clickFastReplyLi(e.content)} }>
                            #<span dangerouslySetInnerHTML={{ __html: e.shortcut }}></span>
                            <span dangerouslySetInnerHTML={{ __html: e.content }}></span>
                        </li>
                    );
                });

                const fastReplyView = <ul>{ fastReply }</ul>;

                this.setState({
                    fastReplyInnerContent: fastReplyView
                });
            } else {
                this.setState({
                    fastReplyInnerContent: ""
                });
            }
        } else if (!text) {
            this.setState({
                fastReplyInnerContent: ""
            });
        }
    };

    clickFastReplyLi = (content) => {
        // let elm = event.target.querySelector('span:nth-child(2)');
        // let message = null;
        // if (elm) {
        //     message = elm.innerText;
        // }
        const htmlTagRegx = /(<([^>]+)>)/ig;
        const m = content.replace(htmlTagRegx, '');
        this.props.order.defaultMessage = m;
        this.setState({
            defaultMessage: m,
            fastReplyInnerContent: '',
        });

        ReactDOM.findDOMNode(this.refs.sendBox).focus();
    }

    updateState = (newState, callback) => {
        this.setState(newState, callback);
    }

    onTextareaPaste = (e) => {
        if (e.clipboardData && e.clipboardData.getData && e.clipboardData.items) {
            const item = e.clipboardData.items[0];
            if (item && item.kind === 'file' && item.type.indexOf('image/') !== -1) {
                const blob = item.getAsFile();
                const reader = new FileReader();
                reader.onload = () => {
                    this.setState({
                        initScreenModalVisible: true,
                        step: 2,
                        imgSrcBlob: event.target.result,
                    });
                };
                reader.readAsDataURL(blob);
            }
        }
    }

    onSend = (e) => {
        const currentActive = document.querySelector('.fast-reply-in-editor li.active');
        const firstLi = document.querySelector('.fast-reply-in-editor li');
        const liContainer = document.querySelector('.fast-reply-in-editor');

        if (e.keyCode === 13 && e.ctrlKey) {
            this.props.order.defaultMessage = `${this.state.defaultMessage}\n`;
            this.setState({
                defaultMessage: `${this.state.defaultMessage}\n`,
            });
        } else {
            if (e.keyCode === 13) {
                if (!e.target.value.trim()) {
                    e.preventDefault();
                    this.props.order.defaultMessage = '';
                    this.setState({
                        defaultMessage: ''
                    })
                    return false;
                }

                if (currentActive) {
                    e.preventDefault();
                    this.props.order.defaultMessage = document.querySelector('.fast-reply-in-editor li.active span:nth-child(2)').innerText;
                    this.setState({
                        defaultMessage: document.querySelector('.fast-reply-in-editor li.active span:nth-child(2)').innerText,
                        fastReplyInnerContent: ''
                    });
                } else {
                    e.preventDefault();
                    this.send(null, e.target.value.trim());
                    this.props.order.defaultMessage = '';
                    this.setState({
                        defaultMessage: '',
                        fastReplyInnerContent: '',
                    });
                }
            }
        }

        if (document.querySelector('.fast-reply-in-editor').innerHTML) {

            switch (e.keyCode) {
                case 38:
                    e.preventDefault();
                    if (currentActive) {
                        if (currentActive.previousSibling) {
                            liContainer.scrollTop = currentActive.previousSibling.offsetTop < liContainer.scrollTop ? currentActive.previousSibling.offsetTop : liContainer.scrollTop;
                            currentActive.previousSibling.className = 'active';
                            currentActive.className = "";
                        }
                    }
                    break;
                case 40:
                    e.preventDefault();
                    if (currentActive) {
                        if (currentActive.nextSibling) {
                            liContainer.scrollTop = currentActive.nextSibling.offsetTop + currentActive.nextSibling.offsetHeight - 100;


                            currentActive.nextSibling.className = 'active';
                            currentActive.className = "";
                        }
                    } else {
                        firstLi.className = "active";
                    }
                    break;
            }
        }
    };

    onEmailTitleChange = (e) => {
        this.props.order.emailTitle = e.target.value;
        this.setState({
            emailTitle: e.target.value,
        });
    }

    onEmailSend = (e) => {
        if (e.keyCode === 13 && e.ctrlKey) {
            this.props.order.defaultMessage = `${this.state.defaultMessage}\n`;
            this.setState({
                defaultMessage: `${this.state.defaultMessage}\n`,
            });
        } else if (e.keyCode === 13) {
            e.preventDefault();
            const title = this.props.order.emailTitle;
            const body = e.target.value.trim();
            const emailInfo = {
                title,
                body,
            };
            this.sendEmail(emailInfo);
            this.props.order.defaultMessage = '';
            this.setState({
                defaultMessage: '',
            });
        }
    }

    onNoteSend = (e) => {
        if (e.keyCode === 13 && e.ctrlKey) {
            this.props.order.defaultMessage = `${this.state.defaultMessage}\n`;
            this.setState({
                defaultMessage: `${this.state.defaultMessage}\n`,
            });
        } else if (e.keyCode === 13) {
            e.preventDefault();
            const body = e.target.value.trim();
            this.sendNote(body);
            this.props.order.defaultMessage = '';
            this.setState({
                defaultMessage: '',
            });
        }
    }

    onShowFace = () => {
        this.setState({
            faceVisible: !this.state.faceVisible,
        });
    };

    onShowReply = () => {
        const fastReplyPanel = document.querySelector('.chatBox-fastReply');
        const mainTab = document.querySelector('.main-tab');
        const fastReplyPanelWidth = 300;

        fastReplyPanel.style.width = `${fastReplyPanelWidth}px`;
        fastReplyPanel.style.transition = '0.2s right';
        mainTab.style.transition = '0.2s padding-right';



        if (!this.state.fastReplyPanelVisible) {
            fastReplyPanel.style.right = '380px';
            mainTab.style.paddingRight = `${fastReplyPanelWidth + 380}px`;
        } else {
            fastReplyPanel.style.right = `${380 - fastReplyPanelWidth}px`;
            mainTab.style.paddingRight = '380px';
        }

        this.setState({
            fastReplyPanelVisible: !this.state.fastReplyPanelVisible
        });

        // this.setState({
        //     replyVisible: !this.state.replyVisible,
        // });
    };

    onInsert = (event, text) => {
        // 阻止 a 标签的行为，如无需要阻止的事件，传递null
        if (event) {
            event.preventDefault();
        }
        this.props.order.defaultMessage += text;
        this.setState({
            defaultMessage: this.state.defaultMessage + text,
            faceVisible: false,
            replyVisible: false,
        });
        ReactDOM.findDOMNode(this.refs.sendBox).focus();
    };

    onCutScreen = (blob) => {
        reqwest({
            url: '/api/upload',
            data: { file: blob, type: 'image/png', encode: 'base64' },
            method: 'POST',
            type: 'json',
        }).then((resp) => {
            if (resp.success) {
                this.send(null, resp.data);
            } else {
                message.error(resp.msg);
            }
        });
    };

    onShowApps = () => {
        this.setState({
            appsVisible: true,
        });
    }

    onAppsGet = (e) => {
        this.setState({
            apps: e.data.data,
        });
    }

    getTiming = () => {
        let hour = 0;
        let minute = 0;
        let sec = 0;
        const self = this;
        if (this.props.order.timer) {
            clearInterval(this.props.order.timer);
        }

        const timer = setInterval(() => {
            sec++;
            if (sec === 59) {
                minute++;
                sec = 0;
            }
            if (minute === 59) {
                hour++;
                minute = 0;
            }

            if (sec < 10) {
                sec = `0${sec}`;
            }
            if (minute < 10 && hour.length !== 2) {
                minute = `0${minute}`;
            }
            if (hour < 10 && hour.length !== 2) {
                hour = `0${hour}`;
            }

            this.props.order.timing = `${hour}:${minute}:${sec}`;
            self.setState({
                timing: `${hour}:${minute}:${sec}`,
            });
        }, 1000);

        this.props.order.timer = timer;
        // this.setState({
        //     timer,
        // });
    };

    send(event, body, callback) {
        // 阻止 a 标签的行为，如无需要阻止的事件，传递null
        if (event) {
            event.preventDefault();
        }

        if (this.state.replyVisible) {
            this.setState({
                replyVisible: false,
            });
        }
        reqwest({
            url: '/api/message/agent',
            data: { to: this.props.order.contact.id, body, type: this.props.order.type },
            method: 'POST',
        }).then((resp) => {
            if (resp.success) {
                if (typeof callback === 'function') callback(resp);
            } else {
                message.error(resp.msg);
            }
        })
    }

    sendEmail = (email) => {
        const { title, body } = email;
        reqwest({
            url: '/api/message/agent',
            data: { to: this.props.order.contact.id, title, body, type: this.props.order.type },
            method: 'POST',
        });

        this.props.order.emailTitle = '';
        this.setState({
            emailTitle: '',
        });
    }

    sendSms = () => {
        const nodes = document.querySelector('.smsTemplate-content div').childNodes;
        const bodyArray = [];

        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].tagName) {
                bodyArray.push(nodes[i].value);
            } else {
                bodyArray.push(nodes[i].data);
            }
        }

        const body = bodyArray.join('');

        reqwest({
            url: '/api/message/agent',
            data: {
                to: this.props.order.contact.id,
                body,
                type: this.props.order.type,
            },
            method: 'POST',
        });
    }

    sendNote = (note) => {
        reqwest({
            url: '/api/message/agent',
            data: { to: this.props.order.contact.id, body: note, type: 'NOTE' },
            method: 'POST',
        });
    }

    quickReply = (e) => {
        const data = e.data.data;
        if (data.length) {
            if (data[0].type === 'COMMON') {
                this.setState({
                    commons: e.data.data,
                });
            } else {
                this.setState({
                    personals: e.data.data,
                });
            }
        }

    };

    order = (e) => {
        this.setState({
            order: e.data.data,
        });

        this.props.updateOrder(e.data.data);
    };

    dismissPreview = () => {
        message.warning('已取消发送');
        this.setState({
            previewVisible: false,
        });
    }

    confirmSendPic = () => {
        this.send(null, this.state.previewUrl);
        this.setState({
            previewUrl: '',
            previewVisible: false,
        });
    }

    hideScreenModal = () => {
        this.setState({
            initScreenModalVisible: false,
        });
    }

    showScreenModal = () => {
        this.setState({
            initScreenModalVisible: true,
        });
    }

    render() {
        const Option = Select.Option;
        const self = this;
        // let defaultMessage = this.state.defaultMessage;
        const faces = (<Face selectFace={this.onInsert} />);
        const order = this.props.order;
        let defaultMessage = order.defaultMessage || '';
        const types = [{ IM: '消息' }];

        if (!order.timing) {
            order.timing = '00:00:00';
        }

        // 快捷回复
        let settingBtn = <Link to="/profile/shortcut"><Icon type="setting" /></Link>;
        let replies = (
            <div className="send-box-replies">
                <Tabs
                    defaultActiveKey="PERSONAL"
                    style={{ width: 400 }}
                    tabBarExtraContent={settingBtn}
                >
                    <TabPane tab="自定义" key="PERSONAL">
                        <ul className="replies">
                            {
                                this.state.personals.map((reply) => (<li key={reply.id}>
                                    {reply.content}
                                    <div className="action">
                                        <a
                                            href="#"
                                            onClick={
                                                (event) => this.onInsert(event, reply.content)
                                            }
                                        >
                                        插入
                                        </a>
                                        <a
                                            href="#"
                                            onClick={
                                                (event) => this.send(event, reply.content)
                                            }
                                        >
                                        发送
                                        </a>
                                    </div>
                                </li>))
                            }
                        </ul>
                    </TabPane>
                    <TabPane tab="通用" key="COMMON">
                        <ul className="replies">
                            {
                                this.state.commons.map((reply) => (<li key={reply.id}>
                                    {reply.content}
                                    <div className="action">
                                        <a
                                            href="#"
                                            onClick={
                                                (event) => this.onInsert(event, reply.content)
                                            }
                                        >
                                        插入
                                        </a>
                                        <a
                                            href="#"
                                            onClick={
                                                (event) => this.send(event, reply.content)
                                            }
                                        >
                                        发送
                                        </a>
                                    </div>
                                </li>))
                            }
                        </ul>
                    </TabPane>
                </Tabs>
            </div>
        );

        if (order.contact.phone) {
            if (this.props.setting.functions && this.props.setting.functions.chat.voip.status) {
                types.push({ VOIP: '电话' });
            }
            if (this.props.setting.functions && this.props.setting.functions.chat.sms.status) {
                types.push({ SMS: '短信' });
            }
        }
        if (order.contact.openid) {
            types.push({ WECHAT: '微信' });
        }

        if (order.contact.weibo_id) {
            types.push({ WEIBO: '微博' });
        }

        if (order.contact.email) {
            types.push({ MAIL: '邮箱' });
        }

        let messageTypes = '';
        if (order.type) {
            messageTypes = (
                <Select value={order.type} style={{ width: 80 }} onChange={this.onChange}>
                    {
                        types.map((type, i) => {
                            let key = Object.keys(type)[0];
                            return <Option key={i} value={key}>{type[key]}</Option>;
                        })
                    }
                </Select>
            );
        }

        // 上传图片
        const uploadPicProps = {
            showUploadList: false,
            name: 'file',
            action: '/api/upload',
            headers: {
                authorization: 'authorization-text',
            },
            onChange(info) {
                if (info.file.status === 'done') {
                    const response = info.file.response;
                    if (response.code !== 200) {
                        message.error(response.msg);
                    } else {
                        message.info('上传成功');
                        const image = new Image();
                        image.src = response.data;

                        self.setState({
                            previewUrl: response.data,
                        });

                        image.onload = () => {
                            self.setState({
                                previewVisible: true,
                            });
                        };
                    }
                } else if (info.file.status === 'error') {
                    message.error('上传失败');
                }
            },
        };

        const picPreview = (
            <div className="pic-preview">
                <img alt="" src={this.state.previewUrl} />
            </div>
        );

        const appsList = (
            <div className="apps-list">
                <h4>应用列表</h4>
                <ul>
                    {this.state.apps.map((app, index) => (
                        <li key={index}>
                            <a target="_blank" href={app.url}>{app.name}</a>
                        </li>
                    ))}
                </ul>
            </div>
        );

        let sendDiv = '';

        if (order.type === 'IM' || order.type === 'WEIBO' || order.type === 'WECHAT') {
            sendDiv = (
                <div className="editor">
                    <div className="fast-reply-in-editor">{ this.state.fastReplyInnerContent }</div>
                    <textarea
                        ref="sendBox"
                        placeholder="按回车直接发送"
                        value={defaultMessage}
                        onChange={(e) => {this.onInput(e)}}
                        onPaste={this.onTextareaPaste}
                        onKeyDown={this.onSend}
                    >
                    </textarea>
                </div>
            );
        } else if (order.type === 'MAIL') {
            sendDiv = (
                <div className="editor email-editor">
                    <Input
                        className="email-title"
                        placeholder="标题"
                        onChange={this.onEmailTitleChange}
                        value={order.emailTitle}
                    />
                    <textarea
                        ref="sendBox"
                        placeholder="按回车直接发送邮件"
                        value={defaultMessage}
                        onChange={(e) => {this.onInput(e, 'MAIL')}}
                        onKeyDown={this.onEmailSend}
                    >
                    </textarea>
                </div>
            );
        }

        const toolsClasses = classNames({
            tools: true,
            show: order.type === 'IM' || order.type === 'WECHAT' || order.type === 'WEIBO',
        });

        let messageBody = (
            <div className="send-body">
                <div className="tool-bar">
                    <ul className={toolsClasses}>
                        <li>
                            <Popover
                                visible={this.state.faceVisible}
                                onClick={this.onShowFace}
                                content={faces}
                                trigger="click"
                                placement="topLeft"
                            >
                                <Icon type="meh" onClick={this.onShowFace} />
                            </Popover>
                        </li>
                        <li>
                            <Upload {...uploadPicProps}>
                                <Icon type="picture" />
                            </Upload>
                        </li>
                        <li>
                            <Popover
                                content={replies}
                                trigger="click"
                                placement="topLeft"
                                visible={this.state.replyVisible}
                                onClick={() => { this.onShowReply() }}
                            >
                                <Icon type="bars" />
                            </Popover>
                        </li>
                        <li>
                            <CutScreen
                                initScreenModalVisible={this.state.initScreenModalVisible}
                                hideScreenModal={this.hideScreenModal}
                                showScreenModal={this.showScreenModal}
                                updateState={this.updateState}
                                step={this.state.step}
                                imgSrcBlob={this.state.imgSrcBlob}
                                onSubmit={this.onCutScreen}
                            >
                                <span
                                    style={{ position: 'absolute', top: -2, left: 0 }}
                                    className="fa fa-crop"
                                />
                            </CutScreen>
                        </li>
                        <li>
                            <Popover
                                content={appsList}
                                placement="topLeft"
                                visible={this.state.appsVisible}
                                onVisibleChange={
                                    (visible) => this.setState({ appsVisible: visible })
                                }
                                trigger="click"
                                onClick={this.onShowApps}
                            >
                                <Icon type="appstore" />
                            </Popover>
                        </li>
                        <li>
                            <Popconfirm
                                title={picPreview}
                                placement="topLeft"
                                visible={this.state.previewVisible}
                                onVisibleChange={this.previewVisibleChange}
                                onConfirm={this.confirmSendPic}
                                onCancel={this.dismissPreview}
                            >
                                <a href="#"></a>
                            </Popconfirm>
                        </li>
                    </ul>
                    <div className="action-bar">
                        {messageTypes}
                    </div>
                </div>
                {sendDiv}
                <div className="tips">
                    按Enter发送，Ctrl+Enter换行
                </div>
            </div>
        );

        let voipStatus = '';
        // console.log(this.props.voipStatus);
        // if (this.props.voipStatus === 'connected') {
        //     order.voipStatus = this.voipStatus;
        // }
        // console.log(this.props.voipStatus);

        switch (order.voipStatus) {
        case 'inbound':
            voipStatus = (
                <div className="voip-status" >
                    <div className="btn inbound" onClick={this.onAnswer}>接听</div>
                </div>
            );
            break;
        case 'outbound':
            voipStatus = (
                <div className="voip-status">
                    <div className="status">呼叫中...{order.timing}</div>
                    <div className="btn hangup" onClick={this.onHangup}>挂断</div>
                </div>
            );
            break;
        case 'active':
            voipStatus = (
                <div className="voip-status">
                    <div className="status">通话中...{order.timing}</div>
                    <div className="btn hangup" onClick={this.onHangup}>挂断</div>
                    <textarea
                        className="note-send"
                        placeholder="按回车提交备注"
                        value={defaultMessage}
                        ref="noteBox"
                        rows={5}
                        onChange={(e) => {this.onInput(e, 'NOTE')}}
                        onKeyDown={this.onNoteSend}
                    ></textarea>
                </div>
            );
            break;
        case 'disabled':
            voipStatus = (
                <div className="voip-status">
                    <div className="status">其他工单通话中...</div>
                </div>
            );
            break;
        default :
            voipStatus = (
                <div className="voip-status">
                    <div className="btn outbound" onClick={this.onCall}>拨打</div>
                </div>
            );
        }

        if (order.type === 'VOIP') {
            messageBody = (
                <div className="send-body">
                    <div className="tool-bar">
                        <div className="action-bar">
                            {messageTypes}
                        </div>
                    </div>
                    <div className="voip">
                        {voipStatus}
                    </div>
                </div>
            );
        }

        if ('SMS' === order.type) {
            messageBody = (
                <div className="send-body">
                    <div className="tool-bar">
                        <div className="action-bar">
                            {messageTypes}
                        </div>
                    </div>
                    <div className="chat-sendBox-sms-container">
                        <div className="smsTemplate-select">
                            <span>请选择短信模板：</span>
                            <Select onSelect={ this.onSmsTemplateSelected }>
                                { this.state.smsTemplateList.map((e, i) => {
                                    return <Option key={ i } value={ e.content }>{ e.title }</Option>
                                }) }
                            </Select>
                        </div>
                        <div className="smsTemplate-content">
                            <div dangerouslySetInnerHTML={{ __html: this.state.smsContentTemplate }}></div>
                        </div>
                        <Button type="primary" onClick={ this.sendSms }>发送</Button>
                    </div>

                </div>

            );
        }

        return (
            <div className="send-box">
                {messageBody}
            </div>
        );
    }

    onSmsTemplateSelected = (value, option) => {
        const smsSignature = this.state.smsSignature;
        this.setState({
            smsContentTemplate: value.replace(/#(.*?)#/g, '<input placeholder="$1" />')
        });
    }
}

SendBox.propTypes = {
    order: PropTypes.object,
    voipStatus: PropTypes.string,
};
