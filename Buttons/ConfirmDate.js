const {EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle} = require('discord.js');
const moment = require('moment');

module.exports = async (Client, interaction) => {
    let data = Client.dateSelector.data;

    let reopenTimestamp = new Date(parseInt(data.year.value), parseInt(data.month.value)-1, parseInt(data.day.value), parseInt(data.hour.value), parseInt(data.minute.value)).valueOf();
    let formatTimestamp = Math.round(reopenTimestamp/1000);
    let currTimestamp = Date.now();

    if (currTimestamp > reopenTimestamp) return interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setColor('9bd2d2')
                .setDescription(':warning: | La date indiquée est déja passée, veuillez la modifier.')
        ], ephemeral: true
    })

    if (Client.reOpenTimeout) clearTimeout(Client.reOpenTimeout);

    Client.reOpenTimeout = setTimeout(() => {
        Client.functions.open(Client)
    }, reopenTimestamp-currTimestamp);

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

    let planningRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('EditPlanning')
                .setLabel('Modifier la programmation')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('📝'),

            new ButtonBuilder()
                .setCustomId('DeletePlanning')
                .setLabel('Supprimer la programmation')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('🗑️')
                .setDisabled(false)
        )

    Client.dashboard.message.edit({ embeds: [
            new EmbedBuilder()
                .setColor('9bd2d2')
                .setDescription('🔒 | La permanence est actuellement fermée !')
        ], components: [closedRow, planningRow], content: null});

    Client.user.setPresence({
        status: 'dnd'
    });

    interaction.message.delete();

    Client.user.setActivity('la permanence fermée !', { type: 'WATCHING'});

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
                            .setDescription(`🔒 | La permanence est actuellement fermée ! La prochaine permanence aura lieu <t:${formatTimestamp}:R>

                            En cas de soucis urgent, n'hésite pas a te rendre dans <#718250345951658064>`)
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

    await Client.reOpen.findAll().then(olds => {
        olds.forEach(async old => {
            await old.destroy();
        })
    });

    await Client.reOpen.create({
        timestamp: reopenTimestamp
    });
}