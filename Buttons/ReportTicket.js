const {EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder} = require('discord.js')

module.exports = async (Client, interaction) => {
    let role = await interaction.message.guild.roles.fetch(Client.settings.referentRoleID);
    if (!role) return interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setColor('9bd2d2')
                .setDescription(':warning: | Il est impossible de vérifier que vous disposez du role Référent Bénévole Écoutant. Merci de signaler cette erreur aux techniciens.')
        ], ephemeral: true
    });

    if (!interaction.member.roles.cache.has(Client.settings.referentRoleID)) return interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setColor('9bd2d2')
                .setDescription(':x: | Seul les Référents Bénévoles Écoutants peuvent effectuer une levée d\'identifiant. Merci de prendre contact avec le référent en charge afin qu\'il effectue cette levée.')
        ], ephemeral: true
    })

    let ticket = await Client.Ticket.findOne({ where: { channelID: interaction.message.channel.id }});
    if (!ticket) return interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setColor('9bd2d2')
                .setDescription(':warning: | Il semblerait que ce salon ne soit pas un salon d\'écoute. Merci d\'utiliser la commande dans l\'un d\'entre eux.')
        ], ephemeral: true
    });

    let options = [
        {
            label: 'Troll',
            value: 'Troll'
        },
        {
            label: 'Chantage affectif',
            value: 'Chantage affectif'
        },
        {
            label: 'Propos inadaptés',
            value: 'Propos inadaptés'
        },
        {
            label: 'Multi appelant.e',
            value: 'Multi appelant.e'
        }
    ];

    let selectRow = new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('ReportTicket')
                .addOptions(options)
        );

    interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setColor('9bd2d2')
                .setDescription('🔍 | Merci de séléctionner la catégorie de signalement.')
        ], components: [selectRow], ephemeral: true
    })
}