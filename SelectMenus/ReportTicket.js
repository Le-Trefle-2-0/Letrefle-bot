const {EmbedBuilder} = require('discord.js');
const bcrypt = require('bcrypt');

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
                .setDescription(':x: | Seul les Référents Bénévoles Écoutants peuvent effectuer un signalement. Merci de prendre contact avec le référent en charge afin qu\'il prenne les mesures nécessaires.')
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

    let reason = interaction.values[0];
    if (!reason) return interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setColor('9bd2d2')
                .setDescription(':warning: | Il semblerait que la raison soit invalide. Merci de réessayer')
        ], ephemeral: true
    });

    bcrypt.hash(ticket.ownerID, 10, async (err, hash) => {
        if (err) return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('9bd2d2')
                    .setDescription(':warning: | Une erreur est survenue lors du chiffrement. Merci de signaler cette erreur aux techniciens.')
            ], ephemeral: true
        });

        let report = await Client.Report.create({
            userID: hash,
            timestamp: Date.now(),
            reason,
        });

        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('9bd2d2')
                    .setDescription(`:white_check_mark: | La vigilance à bien été enregistrée pour la raison \`${reason}\``)
            ]
        });
    });
}