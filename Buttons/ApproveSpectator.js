const {EmbedBuilder, MessageFlags} = require('discord.js');

module.exports = async (Client, interaction) => {
    // Vérification que c'est un référent qui clique
    const referentRoleID = Client.settings.referentRoleID;
    if (!interaction.member.roles.cache.has(referentRoleID)) {
        return interaction.reply({
            content: ':x: | Vous n\'avez pas la permission de valider cette demande.',
            flags: [MessageFlags.Ephemeral]
        });
    }

    const userID = interaction.customId.split('_')[1];
    const member = await interaction.guild.members.fetch(userID).catch(() => null);

    if (!member) {
        return interaction.reply({
            content: ':x: | Utilisateur introuvable.',
            flags: [MessageFlags.Ephemeral]
        });
    }

    // Vérifier s'il est déjà spectateur (au cas où)
    let spec = await Client.spectators.findOne({ where: {userID: userID}});
    if (spec) {
        return interaction.reply({
            content: ':x: | Ce bénévole est déjà en mode spectateur.',
            flags: [MessageFlags.Ephemeral]
        });
    }

    // Ajouter aux spectateurs
    await Client.spectators.create({ userID: userID });

    // Mettre à jour les permissions pour le bénévole
    await updatePermissions(userID, member, true);
    Client.functions.updateAvailable(Client);

    // Modifier le message original pour indiquer que c'est validé
    const embed = EmbedBuilder.from(interaction.message.embeds[0])
        .setColor('57F287')
        .setDescription(`La demande pour <@${userID}> a été validée par <@${interaction.user.id}>.`);

    await interaction.update({
        embeds: [embed],
        components: []
    });

    async function updatePermissions(id, targetMember, status) {
        let tickets = await Client.Ticket.findAll();
        for (let ticket of tickets) {
            // Si le ticket est attribué à quelqu'un (et que ce n'est pas le spectateur lui-même)
            if (ticket.attributed && ticket.attributed !== id) {
                let guild = Client.guilds.cache.get(Client.settings.mainGuildID);
                if (guild) {
                    let channel = await guild.channels.fetch(ticket.channelID).catch(() => null);
                    if (channel) {
                        await channel.permissionOverwrites.create(targetMember, {
                            ViewChannel: status,
                            SendMessages: false,
                        });
                    }
                }
            }
        }
    }
}
