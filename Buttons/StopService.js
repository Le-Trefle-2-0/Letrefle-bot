const {EmbedBuilder} = require('discord.js');

module.exports = async (Client, interaction) => {
    let user = interaction.user;

    let userDB = await Client.available.findOne({ where: { userID: user.id }});
    if (userDB) {
        let service = await Client.services.findOne({ where: { userID: user.id, endTimestamp: null } });
        let ticket = await Client.Ticket.findAll({ where: { attributed: user.id } });
        if (service && ticket.length == 0) {
            service.update({ endTimestamp: Date.now() });
        } else if (ticket.length == 0) {
            await Client.services.create({ userID: user.id, startTimestamp: new Date(userDB.createdAt).getTime(), endTimestamp: Date.now() });
        }
        await userDB.destroy();

        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('9bd2d2')
                    .setDescription('🍀 | Vous n\'êtes plus disponible !')
            ], ephemeral: true
        });

        let tickets = await Client.Ticket.findAll();
        for (let i in Object.keys(tickets)) {
            let guild = Client.guilds.cache.get(Client.settings.mainGuildID);
            if (guild) {
                let channel = await guild.channels.fetch(tickets[i].channelID);
                if (channel) {
                    channel.permissionOverwrites.create(user, {
                        ViewChannel: false
                    });
                }
            }
        }

        Client.functions.updateAvailable(Client)
    } else {
        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('9bd2d2')
                    .setDescription('⚠️ | Vous n\'êtes actuellement pas disponible !')
            ], ephemeral: true
        });
    }
}