const {EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle} = require('discord.js');

module.exports = async (Client, interaction) => {
    interaction.message.delete();

    let closedRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('OpenTicketSystem')
                .setLabel('Commencer une permanence')
                .setStyle(ButtonStyle.Success)
                .setEmoji('🔓'),

            new ButtonBuilder()
                .setCustomId('CloseTicketSystem')
                .setLabel('Fin de la permancence')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🔒')
                .setDisabled(true)
        )

    Client.dashboard.message.edit({ embeds: [
            new EmbedBuilder()
                .setColor('9bd2d2')
                .setDescription('🔒 | La permanence est actuellement fermée !')
        ], components: [closedRow], content: null});

    Client.user.setPresence({
        status: 'dnd'
    });

    Client.user.setActivity('la permanence fermée !', { type: 'WATCHING'});

    interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setColor('9bd2d2')
                .setDescription('✅ | La permanence a bien été fermée !')
        ], ephemeral: true
    })

    let mainGuild = await Client.guilds.fetch(Client.settings.mainGuildID);
    if (mainGuild) {
        let channel = await mainGuild.channels.fetch(Client.settings.ticketOpening.channel);
        if (channel) {
            let message = await channel.messages.fetch(Client.settings.ticketOpening.message);
            if (message) {
                message.edit({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('9bd2d2')
                            .setDescription('🔒 | La permanence est actuellement fermée ! En cas de problème nous t\'invitons à te rendre dans <#718250345951658064>')
                    ],
                    components: []
                })
            }
        }

        let voiceChannel = await mainGuild.channels.fetch(Client.settings.voiceTicketChannelID);
        if (voiceChannel) {
            voiceChannel.permissionOverwrites.edit(mainGuild.id, {
                ViewChannel: false,
                Connect: false,
            });
        }
    }
}