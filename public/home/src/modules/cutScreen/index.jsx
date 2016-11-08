/**
 * Created by henry on 16-5-26.
 */
import React from 'react';
import { Button, Modal, message, Radio, Popconfirm } from 'antd';
import './layout.less';
import Cutter from 'modules/cutScreen/cutter';
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
import html2canvas from 'html2canvas';

export default class cutScreen extends React.Component {
    state = {
        textareaFocus: false,
        current_tool: 'default',
    };

    componentDidMount() {
        document.addEventListener('keyup', this.onKeyUp);
    }

    componentWillUnmount() {
        document.removeEventListener('keyup', this.onKeyUp);
    }

    onKeyUp = (e) => {
        if (e.keyCode === 44) {
            this.initScreenModal();
        }
    }

    // eslint-disable-next-line consistent-return
    onPasteInModal = (e) => {
        if (e.clipboardData && e.clipboardData.getData && e.clipboardData.items) {
            const clipboardData = e.clipboardData;
            const me = this;
            for (let i = 0; i < clipboardData.items.length; i++) {
                const item = clipboardData.items[i];
                if (item && item.kind === 'file' && item.type.match(/^image\//i)) {
                    const blob = item.getAsFile();
                    const reader = new FileReader();
                    reader.onload = () => {
                        me.props.updateState({ step: 2, imgSrcBlob: event.target.result });
                        // me.setState({ step: 2, imgSrcBlob: event.target.result });
                    };
                    reader.readAsDataURL(blob);
                    return false;
                }
            }
            message.warning('粘贴内容不正确');
        }
    };

    onScreenModalCancel = () => {
        this.props.hideScreenModal();
        this.props.updateState({
            step: 1,
            imgSrcBlob: null,
        });

        this.setState({
            current_tool: 'default',
        });
        this.removeCanvasDrag();
    };

    onScreenModalNextStep = () => {
        if (this.props.step === 2) {
            const result = this.refs.cutter.getResult();
            const originImage = this.refs.originImage;
            const originWidth = originImage.width;
            this.props.updateState({ step: 3 }, () => {
                const img = new Image();
                img.src = originImage.src;
                const zoom = img.width / originWidth;
                // const canvas = document.createElement('canvas');
                const canvas = this.refs.canvas;
                canvas.width = result.width * zoom;
                canvas.height = result.height * zoom;
                const cxt = canvas.getContext('2d');
                img.onload = () => {
                    cxt.drawImage(img, result.left * zoom, result.top * zoom, result.width * zoom, result.height * zoom, 0, 0, result.width * zoom, result.height * zoom);
                    // cxt.drawImage(img,100,100);
                };
            });
        } else if (this.props.step === 3) {
            html2canvas(this.refs.canvasContainer).then((c) => {
                const bolb = c.toDataURL('image/png');
                this.props.hideScreenModal();
                this.props.updateState({
                    step: 1,
                    imgSrcBlob: null,
                });
                this.setState({
                    current_tool: 'default',
                });
                this.setState({ output: bolb }, () => {
                    if (this.props.onSubmit) {
                        this.props.onSubmit(bolb);
                    }
                });
            });
            this.removeCanvasDrag();
        }
    };

    onSendImage = () => {
        this.props.hideScreenModal();
        this.props.updateState({
            step: 1,
            imgSrcBlob: null,
        });
        this.props.onSubmit(this.props.imgSrcBlob);
    }

    onTextToolFocus = (e) => {
        if (this.dragState.in_tool_drag) {
            e.preventDefault();
            e.stopPropagation();
            e.target.blur();
            return false;
        }

        return true;
    };

    onCanvasMouseDown = (e) => {
        switch (this.state.current_tool) {
        case 'rectangular': {
            window.getSelection().removeAllRanges();
            const div = document.createElement('div');
            div.className = 'rectangular-tool';
            div.onmousedown = this.onCanvasMouseDown;
            this.refs.canvas.parentElement.appendChild(div);
            this.dragState = {
                startPositionX: e.clientX, startPositionY: e.clientY,
                endPositionX: e.clientX, endPositionY: e.clientY,
                in_tool_drag: true, tool_object: div,
            };
            this.refreshToolObject(e);
            this.initCanvasDrag();
            break;
        }
        case 'text': {
            window.getSelection().removeAllRanges();
            const txt = document.createElement('textarea');
            txt.className = 'text-tool';
            txt.onmousedown = this.onCanvasMouseDown;
            txt.onfocus = this.onTextToolFocus;
            this.refs.canvas.parentElement.appendChild(txt);
            this.dragState = {
                startPositionX: e.clientX, startPositionY: e.clientY,
                endPositionX: e.clientX, endPositionY: e.clientY,
                in_tool_drag: true, tool_object: txt,
            };
            this.refreshToolObject(e);
            this.initCanvasDrag();
            break;
        }
        default:
            break;
        }
    };

    onCanvasMove = (e) => {
        if (this.dragState.in_tool_drag) {
            window.getSelection().removeAllRanges();
            switch (this.state.current_tool) {
            case 'rectangular':
                this.dragState.endPositionX = e.clientX;
                this.dragState.endPositionY = e.clientY;
                this.refreshToolObject(e);
                break;
            case 'text':
                this.dragState.endPositionX = e.clientX;
                this.dragState.endPositionY = e.clientY;
                this.refreshToolObject(e);
                break;
            default:
                break;
            }
        }
    };

    onCanvasMouseUp = () => {
        if (this.dragState.in_tool_drag) {
            this.dragState.in_tool_drag = false;
            if (this.state.current_tool === 'text') {
                this.dragState.tool_object.focus();
                this.setState({ current_tool: 'default' });
            }
        }
        this.removeCanvasDrag();
    };

    onChangeTool = (e) => {
        const childLength = this.refs.canvasContainer.children.length;
        const canvasContainer = this.refs.canvasContainer;
        if (e.target.value === 'undo') {
            if (this.refs.canvasContainer.children.length === 1) {
                message.warning('已经恢复到初始状态了');
            } else {
                canvasContainer.removeChild(canvasContainer.children[childLength - 1]);
            }
            this.setState({ current_tool: 'default' });
        } else {
            this.setState({ current_tool: e.target.value });
        }
        window.getSelection().removeAllRanges();
    };

    getElementPosition = (dom) => {
        let x = dom.offsetLeft;
        let y = dom.offsetTop;
        while (dom.offsetParent) {
            // eslint-disable-next-line no-param-reassign
            dom = dom.offsetParent;
            x += dom.offsetLeft;
            y += dom.offsetTop;
        }
        return { x, y };
    };

    initScreenModal = () => {
        this.props.showScreenModal();
    };

    dragState = {
        in_tool_drag: false,
        tool_object: null,
        startPositionX: 0,
        startPositionY: 0,
        endPositionX: 0,
        endPositionY: 0,
    };

    refreshToolObject = () => {
        if (this.dragState.tool_object) {
            const obj = this.dragState.tool_object;
            const position = this.getElementPosition(this.refs.canvas);

            const line = {
                top: Math.min(this.dragState.startPositionY, this.dragState.endPositionY),
                right: Math.max(this.dragState.startPositionX, this.dragState.endPositionX),
                bottom: Math.max(this.dragState.startPositionY, this.dragState.endPositionY),
                left: Math.min(this.dragState.startPositionX, this.dragState.endPositionX),
            };

            const style = {
                top: line.top - position.y,
                left: line.left - position.x,
                height: line.bottom - line.top,
                width: line.right - line.left,
            };

            if (style.top < 0) {
                style.height += style.top;
                style.top = 0;
            }
            if (style.top >= obj.parentElement.offsetHeight) {
                style.top = obj.parentElement.offsetHeight - 1;
            }
            if (style.height + style.top > obj.parentElement.offsetHeight) {
                style.height = obj.parentElement.offsetHeight - style.top;
            }

            if (style.left < 0) {
                style.width += style.left;
                style.left = 0;
            }
            if (style.left >= obj.parentElement.offsetWidth) {
                style.left = obj.parentElement.offsetWidth - 1;
            }
            if (style.width + style.left > obj.parentElement.offsetWidth) {
                style.width = obj.parentElement.offsetWidth - style.left;
            }

            for (const i in style) {
                if ({}.hasOwnProperty.call(style, i)) {
                    obj.style[i] = `${style[i].toString()}px`;
                }
            }
        }
    };

    initCanvasDrag = () => {
        document.addEventListener('mousemove', this.onCanvasMove, true);
        document.addEventListener('mouseup', this.onCanvasMouseUp, true);
    };

    removeCanvasDrag = () => {
        document.removeEventListener('mousemove', this.onCanvasMove, true);
        document.removeEventListener('mouseup', this.onCanvasMouseUp, true);
    };

    render() {
        let modalfFooter = [];

        if (this.props.step === 2) {
            modalfFooter = [
                <Button
                    key="sendImage"
                    type="primary"
                    size="large"
                    onClick={this.onSendImage}
                >
                    直接发送全图
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    size="large"
                    loading={this.state.loading}
                    onClick={this.onScreenModalNextStep}
                >
                    下一步
                </Button>,
            ];
        } else if (this.props.step === 3) {
            modalfFooter = [
                <Button
                    key="submit"
                    type="primary"
                    size="large"
                    loading={this.state.loading}
                    onClick={this.onScreenModalNextStep}
                >
                    下一步
                </Button>,
            ];
        }

        return (
            <div className="cutScreen">
                <Button
                    onClick={this.initScreenModal}
                    type="ghost"
                    style={{
                        border: 'none',
                        margin: 0,
                        padding: 0,
                        width: 18,
                        height: 19,
                        fontSize: 18,
                    }}
                >
                    {this.props.children}

                    {/*<Popconfirm
                        title="现在按下 Print Screen 按钮"
                        visible={this.state.cutScreenHelpVisible}
                    >
                        <span></span>
                    </Popconfirm>*/}
                </Button>

                <Modal
                    maskClosable={false}
                    width={this.props.step === 1 ? '50%' : '65%'}
                    className="cutScreenModal"
                    title="获取屏幕截图"
                    visible={this.props.initScreenModalVisible}
                    onCancel={this.onScreenModalCancel}
                    footer={modalfFooter}
                >

                    {this.props.step === 1 ? <div>
                        <p>按键盘上的【Print Screen】键获取屏幕截图（Windows 用户可直接按【Print Screen】显示此窗口）</p>
                        <div className={'pasteArea' + (this.state.textareaFocus ? ' focus' : '')}>
                            获取屏幕截图或已复制屏幕截图后，请在此处粘贴【Ctrl + V】
                        </div>
                        <textarea
                            ref="pasteInput"
                            className="paste-input"
                            autoFocus
                            onFocus={() => this.setState({ textareaFocus: true }) }
                            onBlur={(e) => {
                                // this.setState({
                                //     textareaFocus: false,
                                // });
                                if (this.props.step === 1 && this.props.initScreenModalVisible) {
                                    e.target.focus();
                                }
                            }}
                            onPaste={this.onPasteInModal}
                        />
                    </div> : null}

                    {this.props.step === 2 ? <div>
                        <p>选择截图区域</p>
                        <div style={{ position: 'relative' }}>
                            <img
                                ref="originImage"
                                className="cutScreenOrgImage"
                                src={this.props.imgSrcBlob}
                            />
                            <Cutter ref="cutter" />
                        </div>
                    </div> : null}

                    {this.props.step === 3 ? <div>
                        <div style={{ textAlign: 'center' }}>
                            <div>
                                <RadioGroup
                                    value={this.state.current_tool}
                                    size="large"
                                    onChange={this.onChangeTool}
                                >
                                    <RadioButton value="default">
                                        <span className="fa fa-mouse-pointer" />
                                    </RadioButton>
                                    <RadioButton value="rectangular">
                                        <span className="fa fa-square-o" />
                                    </RadioButton>
                                    <RadioButton value="text">
                                        <span className="fa fa-font" />
                                    </RadioButton>
                                    <RadioButton value="undo">
                                        <span className="fa fa-undo" />
                                    </RadioButton>
                                </RadioGroup>
                            </div>
                            <div>
                                <div
                                    ref="canvasContainer"
                                    className="canvasContainer"
                                    style={{
                                        position: 'relative',
                                        marginTop: 15,
                                        display: 'inline-block',
                                        lineHeight: 0,
                                    }}
                                >
                                    <canvas
                                        ref="canvas"
                                        style={{ cursor: (() => {
                                            switch (this.state.current_tool) {
                                            case 'rectangular':
                                                return 'crosshair';
                                            case 'text':
                                                return 'text';
                                            default:
                                                return 'default';
                                            }
                                        })() }}
                                        onMouseDown={this.onCanvasMouseDown}
                                    />
                                </div>
                            </div>
                        </div>
                    </div> : null}
                </Modal>
            </div>
        );
    }
}
