const {io} = require('socket.io-client');
const {EmbedBuilder, Client} = require('discord.js');
let socket;

module.exports = {
    connect: async (Client) => {
        socket = await io(`ws://${process.env.SOLAR_WS}:${process.env.SOLAR_WS_PORT}`);

        Client.Solar.ws = socket;

        // socket.emit('send_message', );

        socket.on('hello', (arg) => {
            Client.log.info('WebSocket connected !');
        });

        socket.emit('bot_connect', {});
        Client.log.info('Bot connected to Solar !');

        socket.on('message', (arg) => {
            // console.log(arg)
        });

        socket.on('messageForBot', async (message) => {
            Client.log.info(`[MESSAGE] ${message.userID}: ${message.content}`)
            let user = await Client.users.fetch(message.userID);
            if (user) user.send({
                embeds: [ 
                    new EmbedBuilder()
                        .setAuthor({ name: 'Bénévole Écoutant' })
                        .setDescription(message.content)
                        .setTimestamp()
                        .setColor('#8CBF86')
                ]
            });
        });

        socket.onAny((event, ...args) => {
            // Client.log.info(event, args);
        });
    }
}