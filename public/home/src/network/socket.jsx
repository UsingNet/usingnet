import io from 'socket.io-client';

let Socket = null;

const SocketConstructor = () => {
    const $ = {};
    const sockets = [];
    const eventDelegate = document.createDocumentFragment();
    $.instances = {};

    $.addEventListener = (eventName, callback) => {
        eventDelegate.addEventListener(eventName, callback);
    };

    $.removeEventListener = (eventName, callback) => {
        eventDelegate.removeEventListener(eventName, callback);
    };

    $.dispatchEvent = (e) => {
        eventDelegate.dispatchEvent(e);
    };

    $.connection = (host, socketName) => {
        const socket = io(host, { enablesXDR: false, transports: ['websocket'] });
        sockets.push(socket);
        if (socketName) {
            $['instances'][socketName] = socket;
            const e = new CustomEvent(`${socketName}Ready`);
            e.socket = socket;
            eventDelegate.dispatchEvent(e);
        }

        const callbackStore = {};
        socket.sendWithCallback = (message, callback) => {
            message.message_id = Math.random();
            if (callback && typeof(callback) === 'function') {
                callbackStore[message.message_id] = callback;
            }
            socket.send(message);
        };

        socket.on('message', (message) => {
            const messageId = message.message_id;
            if (!message.error && messageId && callbackStore[messageId]) {
                const callback = callbackStore[messageId];
                delete callbackStore[messageId];
                callback(message);
            }
        });

        return socket;
    };

    $.closeAll = () => {
        sockets.forEach((socket) => {
            socket.disconnect(true);
        });
    };

    return $;
};

Socket = SocketConstructor();

export default Socket;
