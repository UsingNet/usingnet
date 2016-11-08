/**
 * Created by henry on 16-5-26.
 */
import React from 'react';
import './cutter.less';

export default class Cutter extends React.Component {
    state = {
        top: 0,
        left: 0,
        height: 130,
        width: 130,
        inDrag: false,
        inResize: false,
    };

    constructor() {
        super();
        document.addEventListener('mouseup', (e) => {
            if (this.state.inResize || this.state.inDrag) {
                this.onCenterDragAndResizeEnd(e);
            }
        }, true);
        document.addEventListener('mousemove', (e) => {
            if (this.state.inResize || this.state.inDrag) {
                this.onCenterMove(e);
            }
        }, true);
    }

    componentDidMount() {
        window.addEventListener('resize', this.resizeCutter);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resizeCutter);
    }

    getResult = () => {
        return {
            top: this.state.top,
            left: this.state.left,
            height: this.state.height,
            width: this.state.width,
        };
    };

    onCenterDragStart = (e) => {
        window.getSelection().removeAllRanges();
        this.setState({ inDrag: true, startPositionX: e.clientX, startPositionY: e.clientY });
    };
    onResizeStart = (e, directions) => {
        window.getSelection().removeAllRanges();
        this.setState({ inResize: true, directions: directions, startPositionX: e.clientX, startPositionY: e.clientY });
        e.stopPropagation();
    };

    onCenterDragAndResizeEnd = (e) => {
        this.setState({ inDrag: false, inResize: false });
    };

    onCenterMove = (e) => {
        if (this.state.inDrag) {
            if (e.buttons) {
                window.getSelection().removeAllRanges();
                var deltaX = {
                    left: this.state.left + (e.clientX - this.state.startPositionX),
                    startPositionX: e.clientX,
                };
                if (deltaX.left < 0) {
                    deltaX.startPositionX -= deltaX.left;
                    deltaX.left = 0;
                }
                if (this.refs.container.offsetWidth < deltaX.left + this.state.width) {
                    var overflowX = this.refs.container.offsetWidth - deltaX.left - this.state.width;
                    deltaX.startPositionX += overflowX;
                    deltaX.left += overflowX;
                }
                this.setState(deltaX);

                var deltaY = {
                    top: this.state.top + (e.clientY - this.state.startPositionY),
                    startPositionY: e.clientY,
                };
                if (deltaY.top < 0) {
                    deltaY.startPositionY -= deltaY.top;
                    deltaY.top = 0;
                }
                if (this.refs.container.offsetHeight < deltaY.top + this.state.height) {
                    var overflowY = this.refs.container.offsetHeight - deltaY.top - this.state.height;
                    deltaY.startPositionY += overflowY;
                    deltaY.top += overflowY;
                }
                this.setState(deltaY);
            } else {
                this.onCenterDragAndResizeEnd(e);
            }
        } else if (this.state.inResize) {
            window.getSelection().removeAllRanges();
            if (this.state.directions.indexOf('top') > -1) {
                var deltaTop = e.clientY - this.state.startPositionY;
                var top = this.state.top + deltaTop;
                if (top < 0) {
                    top = 0;
                }
                if ((this.state.top + this.state.height) - top < 20) {
                    top = this.state.top + this.state.height - 20;
                }
                deltaTop = top - this.state.top;
                this.setState({
                    top: top,
                    startPositionY: (this.state.startPositionY + deltaTop),
                    height: (this.state.height - deltaTop),
                });
            }
            if (this.state.directions.indexOf('left') > -1) {
                var deltaLeft = e.clientX - this.state.startPositionX;
                var left = this.state.left + deltaLeft;
                if (left < 0) {
                    left = 0;
                }
                if ((this.state.left + this.state.width) - left < 20) {
                    left = this.state.left + this.state.width - 20;
                }
                deltaLeft = left - this.state.left;
                this.setState({
                    left: left,
                    startPositionX: (this.state.startPositionX + deltaLeft),
                    width: (this.state.width - deltaLeft),
                });
            }
            if (this.state.directions.indexOf('bottom') > -1) {
                var deltaHeight = e.clientY - this.state.startPositionY;
                var height = this.state.height + deltaHeight;
                if (height < 20) {
                    height = 20;
                }
                if (this.state.top + height > this.refs.container.offsetHeight) {
                    height = this.refs.container.offsetHeight - this.state.top;
                }
                deltaHeight = height - this.state.height;
                this.setState({ height: height, startPositionY: this.state.startPositionY + deltaHeight });
            }
            if (this.state.directions.indexOf('right') > -1) {
                var deltaWidth = e.clientX - this.state.startPositionX;
                var width = this.state.width + deltaWidth;
                if (width < 20) {
                    width = 20;
                }
                if (this.state.left + width > this.refs.container.offsetWidth) {
                    width = this.refs.container.offsetWidth - this.state.left;
                }
                deltaWidth = width - this.state.width;
                this.setState({ width: width, startPositionX: this.state.startPositionX + deltaWidth });
            }
        }
    };

    resizeCutter = () => {
        const ratio = 130 / 1920;
        const width = ratio * (window.innerWidth + this.state.width);
        const height = ratio * (window.innerWidth + this.state.height);

        this.setState({
            width,
            height,
        });
    }

    render() {
        return (<div className="cutter" ref="container">
      <div className="shadow top" style={{ height: this.state.top }}></div>
      <div className="shadow right"
          style={{ top: this.state.top, left: (this.state.left + this.state.width), height: this.state.height }}
      ></div>
      <div className="shadow bottom" style={{ top: this.state.top + this.state.height }}></div>
      <div className="shadow left" style={{ top: this.state.top, width: this.state.left, height: this.state.height }}></div>
      <div className="center" ref="center"
          style={{ top: this.state.top, left: this.state.left, height: this.state.height, width: this.state.width }}
          onMouseDown={this.onCenterDragStart}
      >
        <div className="image-editor-selection-border-top"></div>
        <div className="image-editor-selection-border-bottom"></div>
        <div className="image-editor-selection-border-left"></div>
        <div className="image-editor-selection-border-right"></div>

        <span className="resizable-n resizable-handle" onMouseDown={(e) => {this.onResizeStart(e, ['top']);}} />
        <span className="resizable-e resizable-handle" onMouseDown={(e) => {this.onResizeStart(e, ['right']);}} />
        <span className="resizable-w resizable-handle" onMouseDown={(e) => {this.onResizeStart(e, ['left']);}} />
        <span className="resizable-s resizable-handle" onMouseDown={(e) => {this.onResizeStart(e, ['bottom']);}} />
        <span className="resizable-nw resizable-handle" onMouseDown={(e) => {this.onResizeStart(e, ['top', 'left']);}} />
        <span className="resizable-ne resizable-handle" onMouseDown={(e) => {this.onResizeStart(e, ['top', 'right']);}} />
        <span className="resizable-sw resizable-handle" onMouseDown={(e) => {this.onResizeStart(e, ['bottom', 'left']);}} />
        <span className="resizable-se resizable-handle" onMouseDown={(e) => {this.onResizeStart(e, ['bottom', 'right']);}} />

      </div>
    </div>);
    }
}
