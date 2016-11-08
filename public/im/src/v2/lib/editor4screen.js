/**
 * Created by henry on 16-1-20.
 */
define(['lib/html2canvas'], function(html2canvas){

    var CutTools = function(){
        var container = document.createElement('div');
        var onMouseUp = null;
        var me = this;
        container.style.position = 'fixed';
        container.style.height = window.innerHeight + 'px';
        container.style.width = window.innerWidth + 'px';
        container.style.left = 0;
        container.style.top = 0;
        container.style.zIndex = 2147483550;
        container.style.cursor = 'cell';
        var masks = [];
        var point1, point2;
        for(var i = 0;i<4;i++){
            var mask = document.createElement('div');
            container.appendChild(mask);
            masks.push(mask);
            mask.style.position = 'fixed';
            mask.style.backgroundColor = '#AAA';
            mask.style.opacity = 0.2;
            mask.style.top = '0px';
            mask.style.right = '0px';
            mask.style.bottom = '0px';
            mask.style.left = '0px';
            mask.style.height = window.innerHeight + 'px';
            if(i){
                mask.style.width = '0px';
            }
        }
        var centerMask = document.createElement('div');

        centerMask.innerHTML = '<div class="image-editor-selection-border-top"></div>' +
            '<div class="image-editor-selection-border-bottom"></div>' +
            '<div class="image-editor-selection-border-left"></div>' +
            '<div class="image-editor-selection-border-right"></div>' +
            // '<span class="resizable-n resizable-handle"></span>' +
            // '<span class="resizable-e resizable-handle"></span>' +
            // '<span class="resizable-w resizable-handle"></span>' +
            // '<span class="resizable-s resizable-handle"></span>' +
            // '<span class="resizable-nw resizable-handle"></span>' +
            // '<span class="resizable-ne resizable-handle"></span>' +
            // '<span class="resizable-sw resizable-handle"></span>' +
            // '<span class="resizable-se resizable-handle"></span>' +
            '<style>.image-editor-selection-border-bottom,.image-editor-selection-border-top{position:absolute;left:0;right:0;height:1px;background-image:url("data:image/gif;base64,R0lGODlhBgABAKEAAP///wAAADY2Nv///yH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQACgD/ACwAAAAABgABAAACAxQuUgAh+QQBCgADACwAAAAABgABAAACA5SAUgAh+QQBCgADACwAAAAABgABAAACA5SBBQAh+QQBCgADACwAAAAABgABAAACA4QOUAAh+QQBCgADACwAAAAABgABAAACAwSEUAAh+QQBCgADACwAAAAABgABAAACA4SFBQA7");z-index:1}.image-editor-selection-border-top{top:0}.image-editor-selection-border-bottom{bottom:0}.image-editor-selection-border-left,.image-editor-selection-border-right{position:absolute;top:0;bottom:0;width:1px;background-image:url("data:image/gif;base64,R0lGODlhAQAGAKEAAP///wAAADY2Nv///yH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQACgD/ACwAAAAAAQAGAAACAxQuUgAh+QQBCgADACwAAAAAAQAGAAACA5SAUgAh+QQBCgADACwAAAAAAQAGAAACA5SBBQAh+QQBCgADACwAAAAAAQAGAAACA4QOUAAh+QQBCgADACwAAAAAAQAGAAACAwSEUAAh+QQBCgADACwAAAAAAQAGAAACA4SFBQA7");z-index:1}.image-editor-selection-border-left{left:0}.image-editor-selection-border-right{right:0}.resizable-handle{position:absolute;width:6px;height:6px;border:1px solid #000;box-shadow:1px 1px 0 hsla(0,0%,100%,.6),inset 1px 1px 0 hsla(0,0%,100%,.6)}.resizable-nw{cursor:nw-resize;left:1px;top:1px}.resizable-ne{cursor:ne-resize;right:1px;top:1px}.resizable-sw{bottom:1px;cursor:sw-resize;left:1px}.resizable-se{bottom:1px;cursor:se-resize;right:1px}.resizable-n{cursor:n-resize;left:50%;margin-left:-3px;top:1px}.resizable-s{bottom:1px;cursor:s-resize;left:50%;margin-left:-3px}.resizable-w{cursor:w-resize;left:1px;margin-top:-3px;top:50%}.resizable-e{cursor:e-resize;margin-top:-3px;right:1px;top:50%}</style>';

        container.appendChild(centerMask);
        masks.push(centerMask);
        centerMask.style.position = 'fixed';
        centerMask.style.top = '0px';
        centerMask.style.right = '0px';
        centerMask.style.bottom = '0px';
        centerMask.style.left = '0px';
        centerMask.style.width = '0px';
        centerMask.style.height = '0px';
        //centerMask.style.border = '1px solid #F00';

        var reflushRect = function(){
            if(!point1 || !point2){
                return false;
            }
            var top = Math.min(point1.y, point2.y);
            var right = Math.max(point1.x, point2.x);
            var bottom = Math.max(point1.y, point2.y);
            var left = Math.min(point1.x, point2.x);

            masks[0].style.bottom = (window.innerHeight - top)+'px';
            masks[0].style.height = top+'px';
            masks[0].style.width = window.innerWidth + 'px';

            masks[1].style.left = right+'px';
            masks[1].style.width = (window.innerWidth - right)+'px';
            masks[1].style.top = top + 'px';
            masks[1].style.height = (bottom - top) + 'px';

            masks[2].style.top = bottom+'px';
            masks[2].style.height = (window.innerHeight - bottom)+'px';
            masks[2].style.width = window.innerWidth + 'px';

            masks[3].style.right = (window.innerWidth - left)+'px';
            masks[3].style.width = left+'px';
            masks[3].style.top = top + 'px';
            masks[3].style.height = (bottom - top) + 'px';

            centerMask.style.top = (top-1) + 'px';
            centerMask.style.left = (left-1) + 'px';
            centerMask.style.height = (bottom-top+2) + 'px';
            centerMask.style.width = (right-left+2) + 'px';
        };
        var onMouseMove = function(e){
            point2 = {x: e.clientX, y: e.clientY};
            //debugger;
            reflushRect(point1, point2);
        };

        container.addEventListener('mousedown', function(e){
            point1 = {x: e.clientX, y: e.clientY};
            reflushRect();
            container.addEventListener('mousemove', onMouseMove);
        });

        var stopCut = function(e){
            if(!point1){
                return false;
            }
            point2 = {x: e.clientX, y: e.clientY};
            reflushRect();
            container.removeEventListener('mousemove', onMouseMove);
            if(typeof(onMouseUp) == 'function'){
                onMouseUp();
            }
        };
        container.addEventListener('mouseup', stopCut);
        document.body.addEventListener('mouseout', function(e){
            if(e.clientX < 5 || e.clientY < 5 || (window.innerWidth- e.clientX < 5) || (window.innerHeight - e.clientY < 5)){
                stopCut(e);
            }
        });

        this.show = function(callback){
            document.body.appendChild(container);
            onMouseUp = function(){
                if(typeof(callback) == 'function'){
                    callback(point1, point2);
                }
                me.hide();
            }
        };

        this.hide = function(){
            document.body.removeChild(container);
            onMouseUp = null;
            point1 = null;
            point2 = null;
            try{container.removeEventListener('mousemove', onMouseMove);}catch(e){}
        };
    };

    var mask = document.createElement('div');
    mask.style.position = 'fixed';
    mask.style.width = window.innerWidth+'px';
    mask.style.height = window.innerHeight+'px';
    mask.style.opacity = 0.9;
    mask.style.zIndex = 2147483550;
    mask.style.top = 0;
    mask.style.left = 0;
    mask.style.backgroundColor = '#AAA';
    mask.innerHTML = '<div style="text-align: center;margin-top:50%;">正在截图, 请稍后...</div>';
    mask.style.display = 'none';
    mask.display = function(){
        mask.style.display = 'block';
    };
    mask.hide = function(){
        mask.style.display = 'none';
    };
    document.body.appendChild(mask);


    var iframe = document.createElement('iframe');
    var dialog = document.createElement('dialog');
    dialog.style.border = '0';
    dialog.style.padding = '0';

    iframe.src = 'about:blank';

    iframe.addEventListener('load', function(){
        iframe.contentWindow.document.body.appendChild(dialog);
    });
    iframe.style.display = 'none';
    iframe.style.position = 'fixed';
    iframe.style.left = 0;
    iframe.style.right = 0;
    iframe.style.margin = '0 auto';
    iframe.style.zIndex = 2147483567;
    iframe.style.top = '5%';
    iframe.style.border = '0';

    document.body.appendChild(iframe);

    dialog.style.textAlign = 'center';
    var zoom = 1;
    var onCanvasClick = null;
    var onCanvasMouseDown = null;
    var onCanvasMouseUp = null;
    var onCanvasMouseMove = null;
    var canvasStore = [];

    dialog.className = 'editor4screen';
    //dialog.style.display = 'none';
    dialog.style.position = 'fixed';
    dialog.style.left = 0;
    dialog.style.right = 0;
    dialog.style.margin = '0 auto';

    if(typeof(dialog.show) == 'function'){
        dialog.show();
    }
    dialog.display = function(){
        mask.querySelector('div').style.display = 'none';
        mask.display();
        dialog.style.width = 'auto';
        //dialog.style.display = 'block';
        iframe.style.display = 'block';
        dialog.style.width = Math.max(Math.ceil(lastCanvas.width*zoom), 200)+'px';
        iframe.style.width = (parseInt(dialog.style.width)+20)+'px';
        iframe.style.height = (dialog.offsetHeight+20) + 'px';

        onCanvasClick = null;
        onCanvasMouseDown = null;
        onCanvasMouseUp = null;
        onCanvasMouseMove = null;
    };
    dialog.hide = function(){
        mask.querySelector('div').style.display = '';
        mask.hide();
        //dialog.style.display = 'none';
        iframe.style.display = 'none';
        onCanvasClick = null;
        onCanvasMouseDown = null;
        onCanvasMouseUp = null;
        onCanvasMouseMove = null;
    };


    //dialog.style.top = '5%';
    //dialog.style.zIndex = 99998;
    dialog.innerHTML = '<h4>截图</h4><canvas></canvas><div><nav style="float:right;margin-top:1em;border: 1px solid;width:170px; height:28px;"></nav></div>';
    //document.body.appendChild(dialog);

    var lastCanvas = dialog.querySelector('canvas');
    var onCheckedCallback = null;
    var getRealOffset = function(element){
        var point = {x:element.offsetLeft,y: element.offsetTop};
        var current = element.offsetParent;
        while (current !== null){
            point.x += current.offsetLeft;
            point.y += current.offsetTop;
            current = current.offsetParent;
        }
        return point;
    };
    /* IE and Edge */
    var isIE = !!navigator.userAgent.toUpperCase().match(/MSIE|TRIDENT/);
    var isEdge = !!navigator.userAgent.toUpperCase().match(/EDGE/);
    var isFirefox = !!navigator.userAgent.toUpperCase().match(/FIREFOX/);

    var getOffsetPoint = function(e){
        if(isIE || isEdge || isFirefox) {
            var basePoint = getRealOffset(e.target);
            return {
                x: (e.pageX - basePoint.x) / zoom,
                y: (e.pageY - basePoint.y) / zoom
            };
        }else{
            return {x: e.offsetX/zoom, y: e.offsetY/zoom};
        }
    };

    var nextCanvas = function(canvas){
        if(!canvas){
            canvas = document.createElement("canvas");
            canvas.width = lastCanvas.width;
            canvas.height = lastCanvas.height;
            canvas.getContext('2d').drawImage(lastCanvas, 0, 0);
        }
        canvasStore.push(lastCanvas);
        dialog.replaceChild(canvas, lastCanvas);
        lastCanvas = canvas;
        zoom = Math.min(window.innerWidth/lastCanvas.width, window.innerHeight/lastCanvas.height);
        if(zoom<1.3){
            zoom = 0.7
        }else if(zoom<2){
            zoom = 1;
        }else{
            zoom = zoom*0.7;
        }
        if(isFirefox){
            zoom = 1;
        }

        lastCanvas.style.zoom = zoom;

        lastCanvas.addEventListener('click',function(e){
            if(typeof(onCanvasClick) == 'function'){
                onCanvasClick(e);
            }
        });
        lastCanvas.addEventListener('mousedown',function(e){
            if(typeof(onCanvasMouseDown) == 'function'){
                onCanvasMouseDown(e);
            }
        });
        lastCanvas.addEventListener('mouseup',function(e){
            if(typeof(onCanvasMouseUp) == 'function'){
                onCanvasMouseUp(e);
            }
        });
        lastCanvas.addEventListener('mousemove',function(e){
            if(typeof(onCanvasMouseMove) == 'function'){
                onCanvasMouseMove(e);
            }
        });
        lastCanvas.oncontextmenu = function(){return false;};
        return lastCanvas;
    };

    var loadLastCanvas = function(){
        if(canvasStore.length){
            var canvas = canvasStore.pop();
            canvas.style.cursor = lastCanvas.style.cursor;
            dialog.replaceChild(canvas, lastCanvas);
            lastCanvas = canvas;
            return lastCanvas;
        }
        return null;
    };


    // Tools
    var buildToolButton = function(title){
        var button = document.createElement('a');
        button.href = 'javascript:void(0)';
        button.title = title;
        button.innerHTML = '<span style="display: inline-block;width: 34px;height: 28px;line-height: 15px;text-align: center;color: #000;"></span>';
        return button;
    };

    var nav = dialog.querySelector('nav');
    if(require.version){
        nav.style.backgroundImage = 'url('+location.protocol+'//im.usingnet.net/src/v2/image/cuttoolbar.png)';
    }else{
        nav.style.backgroundImage = 'url('+location.protocol+'//im.usingnet.net/build/v2/image/cuttoolbar.png)';
    }

    var tools_addText = buildToolButton('文字');
    tools_addText.addEventListener('click', function(){
        lastCanvas.style.cursor = 'text';
        onCanvasMouseDown = null;
        onCanvasMouseUp = null;
        onCanvasMouseMove = null;
        onCanvasClick = function(e){
            var point = getOffsetPoint(e);
            var context2D = nextCanvas().getContext('2d');
            lastCanvas.style.cursor = 'text';
            context2D.font = Math.max(Math.ceil(30/zoom),12) + "px Courier New";
            context2D.lineWidth = 2;
            context2D.strokeStyle = 'red';

            var textarea = document.createElement('textarea');
            //textarea.editable = true;
            textarea.style.position = 'fixed';
            textarea.style.zIndex = 99999;
            if(isIE){
                textarea.style.left = e.clientX+'px';
                textarea.style.top = e.clientY+'px';
            }else{
                textarea.style.left = Math.ceil(e.clientX/zoom)+'px';
                textarea.style.top = Math.ceil(e.clientY/zoom)+'px';
            }
            textarea.style.height = Math.min(40,lastCanvas.height - point.y) + 'px';
            textarea.style.width = Math.min(120,lastCanvas.width - point.x) + 'px';
            //textarea.style.fontSize = Math.max(Math.ceil(30/zoom),12) + "px";
            textarea.style.fontSize = Math.ceil(30/zoom) + 'px';
            if(isFirefox){
                textarea.style.transform = 'scale('+zoom+')';
            }else{
                textarea.style.zoom = zoom;
            }
            textarea.style.fontFamily = 'Courier New';
            textarea.style.color = 'red';
            dialog.appendChild(textarea);
            textarea.focus();
            textarea.addEventListener('keypress', function(e){
               if((e.keyCode == 13||e.keyCode == 10) && !e.crtlKey){
                   textarea.blur();
               }
            });
            textarea.addEventListener('blur', function(){
                var text = textarea.value;
                dialog.removeChild(textarea);
                if(text) {
                    context2D.strokeText(text, point.x, point.y+15);
                }else{
                    loadLastCanvas();
                }
            });
        };
    });

    var tools_paintBruch = buildToolButton('笔刷');
    tools_paintBruch.addEventListener('click', function(){
        lastCanvas.style.cursor = 'cell';
        var context2D = null;
        var lastPoint = null;
        onCanvasClick = null;
        onCanvasMouseDown = function(e){
            lastPoint = getOffsetPoint(e);
            //debugger;
            context2D = nextCanvas().getContext('2d');
            lastCanvas.style.cursor = 'cell';
            context2D.lineWidth = 2;
            context2D.strokeStyle = 'red';
        };
        onCanvasMouseMove = function(e){
            if(lastPoint){
                context2D.beginPath();
                context2D.moveTo(lastPoint.x, lastPoint.y);
                lastPoint = getOffsetPoint(e);
                context2D.lineTo(lastPoint.x, lastPoint.y);
                context2D.stroke();
            }
        };
        onCanvasMouseUp = function(e){
            lastPoint = null;
        };
    });

    var tools_return = buildToolButton('撤销');
    tools_return.addEventListener('click', function(){
        loadLastCanvas();
    });


    var tools_check = buildToolButton('确定');
    tools_check.addEventListener('click', function(){
        var data = lastCanvas.toDataURL("image/png");
        if(data && typeof(onCheckedCallback) == 'function'){
            onCheckedCallback(data);
        }
        dialog.hide();
    });

    var tools_cancel = buildToolButton('取消');
    tools_cancel.addEventListener('click', function(){
        dialog.hide();
    });

    nav.appendChild(tools_addText);
    nav.appendChild(tools_paintBruch);
    nav.appendChild(tools_return);
    nav.appendChild(tools_check);
    nav.appendChild(tools_cancel);

    return function(dom, callback){
        var ct = new CutTools();
        ct.show(function(point1, point2){
            if(!point1 || !point2){
                return false;
            }
            onCheckedCallback = callback;

            var top = Math.min(point1.y, point2.y);
            var left = Math.min(point1.x, point2.x);
            var width = Math.max(point1.x, point2.x) - left;
            var height = Math.max(point1.y, point2.y) - top;

            html2canvas(dom, {useCORS:false, proxy:'http://app.usingnet.net/api/proxy/image', rectangle:{
                top:top+ document.body.scrollTop,right:left+width+document.body.scrollLeft,bottom:top+height+ document.body.scrollTop,left:left+document.body.scrollLeft
            }}).then(function (canvas) {
                var cutCanvas = document.createElement('canvas');
                if(width*height>4){
                    cutCanvas.width = width;
                    cutCanvas.height = height;
                    cutCanvas.getContext('2d').drawImage(canvas, left, top, width, height, 0, 0, width ,height);
                    nextCanvas(cutCanvas);
                    canvasStore = [];
                    dialog.display();
                }else{
                    mask.hide();
                }
            });
            mask.display();
        });
    };
});