const {EmbedBuilder} = require('discord.js');

module.exports = async (Client, interaction) => {
    let spec = await Client.spectators.findOne({ where: {userID: interaction.user.id}});
    if (spec) {
        await spec.destroy();

        update(false);
        Client.functions.updateAvailable(Client);

        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('9bd2d2')
                    .setDescription(':eyes: | Vous avez bien quitté le mode spectateur')
            ], ephemeral: true
        });
    } else {
        spec = await Client.spectators.create({
            userID: interaction.user.id,
        });

        update(true);
        Client.functions.updateAvailable(Client);

        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('9bd2d2')
                    .setDescription(':eyes: | Vous avez bien rejoint la permanence en tant que spectateur')
            ], ephemeral: true
        });
    }

    async function update(status) {
        let tickets = await Client.Ticket.findAll();
        for (let i in Object.keys(tickets)) {
            if (tickets[i].attributed !== interaction.user.id) {
                let guild = Client.guilds.cache.get(Client.settings.mainGuildID);
                if (guild) {
                    let channel = await guild.channels.fetch(tickets[i].channelID);
                    if (channel) {
                        channel.permissionOverwrites.create(interaction.member, {
                            ViewChannel: status,
                            SendMessages: false,
                        });
                    }
                }
            }
        }
    }
}