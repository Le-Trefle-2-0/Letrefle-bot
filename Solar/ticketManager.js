module.exports = {
    openTicket: async (Client, discordUserID) => {
        const payload = {
            token: process.env.SOLAR_TOKEN,
            discordUserID,
        }

        const res = await fetch(`${Client.settings.solar.url}/api/tickets/create`, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        if (res.status === 200) {
            Client.Solar.socket.emit('update', {})
            return res.json();
        } else return false;
    },
    findTicket: async (Client, info) => {
        let Ticket = null;
        if (info.channelId) Ticket = Client.Solar.tickets.cache.find(ticket => ticket.channelId === info.channelId);
        if (info.discordUserID) Ticket = Client.Solar.tickets.cache.find(ticket => ticket.discordUserID === info.discordUserID);

        if (!Ticket) {
            if (Client.Solar.tickets.cache.date-Date.now()<5000) return null;
            const res = await fetch(`${Client.settings.solar.url}/api/tickets`, {
                method: 'GET',
                headers: {
                    token: process.env.SOLAR_TOKEN
                }
            });
            Client.Solar.tickets.cache = await res.json();
            Client.Solar.tickets.cache.date = Date.now();
            return findTicket(Client, info);
        } else return Ticket;
    }
}