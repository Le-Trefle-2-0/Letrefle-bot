const socket = require('./socket')

module.exports = async (Client) => {
    const checkKey = await fetch(`${Client.settings.solar.url}/api/check-key`, {
        method: 'POST',
        body: JSON.stringify({
            key: process.env.SOLAR_TOKEN,
        })
    });

    const body = await checkKey.json();
    Client.Solar.user = body.user;
    if (Client.Solar.user.role !== 'bot') throw new Error(`Le compte connecté n'est pas un compte BOT compatible.`);
    socket.init(Client);
}