const {EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require('discord.js');

module.exports = async (Client, interaction) => {
    await Client.reOpen.findAll().then(olds => {
        olds.forEach(async old => {
            await old.destroy();
        })
    });

    if (Client.reOpenTimeout) {
        clearTimeout(Client.reOpenTimeout);
        Client.reOpenTimeout = null;
    }

    let mainGuild = await Client.guilds.fetch(Client.settings.mainGuildID);
    if (mainGuild) {
        let channel = await mainGuild.channels.fetch(Client.settings.ticketOpening.channel);
        if (channel) {
            let message = await channel.messages.fetch(Client.settings.ticketOpening.message);
            if (message) {
                // Check if currently open or closed to set appropriate message
                let currentStatus = await Client.user.presence.status;
                if (currentStatus === 'dnd') { // Closed
                    message.edit({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('9bd2d2')
                                .setDescription('🔒 | La permanence est actuellement fermée ! En cas de problème nous t\'invitons à te rendre dans <#718250345951658064>')
                        ],
                        components: []
                    });
                }
            }
        }
    }

    // Refresh dashboard WITHOUT triggering open/close logic
    let reopen = await Client.reOpen.findAll();
    let hasPlanning = reopen.length > 0;

    let currentStatus = await Client.user.presence.status;
    let isClosed = currentStatus === 'dnd';

    if (isClosed) {
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
            );

        let planningRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('EditPlanning')
                    .setLabel(hasPlanning ? 'Modifier la programmation' : 'Programmer la prochaine permanence')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📝'),

                new ButtonBuilder()
                    .setCustomId('DeletePlanning')
                    .setLabel('Supprimer la programmation')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🗑️')
                    .setDisabled(!hasPlanning)
            )

        Client.dashboard.message.edit({
            embeds: [
                new EmbedBuilder()
                    .setColor('9bd2d2')
                    .setDescription('🔒 | La permanence est actuellement fermée !')
            ],
            components: [closedRow, planningRow],
            content: null
        });
    } else {
        // If open, just update the buttons if needed (though DeletePlanning is usually for when closed)
        let openRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('OpenTicketSystem')
                    .setLabel('Commencer une permanence')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🔓')
                    .setDisabled(true),

                new ButtonBuilder()
                    .setCustomId('CloseTicketSystem')
                    .setLabel('Fin de la permancence')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔒')
            )

        let planningRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('EditPlanning')
                    .setLabel(hasPlanning ? 'Modifier la programmation' : 'Programmer la prochaine permanence')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📝'),

                new ButtonBuilder()
                    .setCustomId('DeletePlanning')
                    .setLabel('Supprimer la programmation')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🗑️')
                    .setDisabled(!hasPlanning)
            )

        Client.dashboard.message.edit({
            embeds: [
                new EmbedBuilder()
                    .setColor('9bd2d2')
                    .setDescription('🔓 | La permanence est actuellement ouverte !')
            ],
            components: [openRow, planningRow],
            content: null
        });
    }

    interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setColor('9bd2d2')
                .setDescription('✅ | La programmation a bien été supprimée !')
        ], ephemeral: true
    });
}
