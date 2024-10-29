const {EmbedBuilder} = require('discord.js');

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

    let user = await Client.users.fetch(ticket.ownerID);
    if (!user) return interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setColor('9bd2d2')
                .setDescription(`:warning: | Il semblerait que l'utilisateur de cette écoute ne soit pas accessible. Les informations avancées ne sont pas disponibles.\n\n**Identifiant :** \`${ticket.ownerID}\``)
        ], ephemeral: true
    });

    let member = await interaction.message.guild.members.fetch(user.id);
    interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setColor('9bd2d2')
                .setAuthor({ name: user.tag })
                .setThumbnail(user.avatarURL())
                .setDescription(`Identifiant : \`${user.id}\`\nCréation du compte : <t:${Math.round(user.createdTimestamp/1000)}:R>\nRejoint le serveur : <t:${Math.round(member.joinedTimestamp/1000)}:R> `)
        ]
    })
}