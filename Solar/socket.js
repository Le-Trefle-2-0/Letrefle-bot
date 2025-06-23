const io = require('socket.io-client');
module.exports = {
    init: (Client) => {
        console.log('Client initializing');
        const socket = io(Client.settings.solar.socket.url, {
            auth: {
                token: process.env.SOLAR_TOKEN,
            }
        });
        Client.Solar.socket = socket;
        socket.on('connect', () => {
            console.log(`Client connected!`);
        });
        socket.emit('listen', {id: '1'});
        socket.on('message', (message) => {
            console.log(message);
        })
    }
}