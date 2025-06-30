const io = require('socket.io-client');
const {findTicket} = require("./ticketManager");

if (process.env.NODE_ENV !== 'production') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const listen = async (Client) => {
    const res = await fetch(`${Client.settings.solar.url}/api/tickets`, {
        method: 'GET',
        headers: {
            token: process.env.SOLAR_TOKEN
        }
    });
    const tickets = await res.json();
    Client.Solar.tickets = {
        cache: tickets,
        date: Date.now()
    }

    for (const ticket of tickets) {
        Client.Solar.socket.emit('listen', {id: ticket.channelId});
    }
}

module.exports = {
    init: (Client) => {
        Client.log.info('Solar client initializing');
        const socket = io(Client.settings.solar.url, {
            auth: {
                token: process.env.SOLAR_TOKEN,
            },
            secure: true,
            transports: ['websocket'],
            rejectUnauthorized: (process.env.NODE_ENV === 'production'),
        });
        Client.Solar.socket = socket;
        Client.Solar.ping = -1;
        setInterval(() => {
            const start = Date.now();

            socket.emit('ping', () => {
                Client.Solar.ping = (Date.now() - start);
            })
        }, 5000)
        socket.on('connect', () => {
            Client.log.info(`WebSocket connection to Solar has been established`);
        });
        socket.on('message', async (message) => {
            console.log(message);
            const Ticket = await findTicket(Client, { channelId: message.channel.id });
            if (Ticket) {
                console.log('ticket found')
                let user = await Client.Discord.users.fetch(Ticket.discordUserID);
                if (user) {
                    console.log(`User found ${user.username}`);
                    user.send(message);
                }
            }
        });
        listen(Client);
    },
}