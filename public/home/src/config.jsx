
const domain = location.host.replace('home.', '');
const protocol = location.protocol;

const wsProtocol = protocol === 'https:'  ? 'wss' : 'ws';

const config = {
    login: `https://auth.${domain}`,
    logout: `https://auth.${domain}/logout`,
    api: `${protocol}//home.${domain}/api`,
    socket: `${wsProtocol}://ws.${domain}/?_token=`,
    voipToken: 'aaf98f8951af2ba80151c2135efe4650',
};

export default config;
