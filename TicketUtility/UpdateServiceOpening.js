const {EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require('discord.js');
const checkOpening = require('./CheckService');

module.exports = async (Client) => {
    let dashboardGuild = await Client.guilds.fetch(process.env.LISTEN_DASHBOARD_SERVER);
    if (dashboardGuild) {
        let dashboardChannel = await dashboardGuild.channels.fetch(process.env.LISTEN_DASHBOARD_CHANNEL);
        if (dashboardChannel) {
            async function checkForOpening() {
                console.log('Checking for opening...')
                checkOpening(Client).then((opening) => {
                    dashboardChannel.messages.fetch(process.env.LISTEN_DASHBOARD_MESSAGE).then((message) => {
                        let row = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('OpenTicket')
                                    .setLabel('Ouvrir une écoute')
                                    .setEmoji("👋")
                                    .setStyle(ButtonStyle.Success)
                            );

                        message.edit({
                            embeds: [
                                new EmbedBuilder()
                                    .setDescription('La permanence d\'écoute est actuellement ouverte !\nPour ouvrir une écoute, cliquez sur le bouton ci-dessous.')
                                    .setTimestamp()
                                    .setFooter({ text: 'Dernière mise à jour' })
                                    .setColor('#9bd2d2')
                            ], components: [row]
                        });
                    });
                }).catch(() => {
                    // dashboardChannel.messages.fetch(process.env.LISTEN_DASHBOARD_MESSAGE).then((message) => {
                    //     message.edit({
                    //         embeds: [
                    //             new EmbedBuilder()
                    //                 .setDescription('La permanence d\'écoute est actuellement fermée !')
                    //                 .setTimestamp()
                    //                 .setFooter({ text: 'Dernière mise à jour' })
                    //                 .setColor('#BF8686')
                    //         ], components: []
                    //     });
                    // });

                    dashboardChannel.messages.fetch(process.env.LISTEN_DASHBOARD_MESSAGE).then((message) => {
                        let row = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('OpenTicket')
                                    .setLabel('Ouvrir une écoute')
                                    .setEmoji("👋")
                                    .setStyle(ButtonStyle.Success)
                            );

                        message.edit({
                            embeds: [
                                new EmbedBuilder()
                                    .setDescription('La permanence d\'écoute est actuellement ouverte !\nPour ouvrir une écoute, cliquez sur le bouton ci-dessous.')
                                    .setTimestamp()
                                    .setFooter({ text: 'Dernière mise à jour' })
                                    .setColor('#9bd2d2')
                            ], components: [row]
                        });
                    });
                });
            }

            checkForOpening();
            setInterval(() => {
                checkForOpening();
            }, 30000);
        }
    }
}