const {EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags} = require('discord.js');

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
            ], flags: [MessageFlags.Ephemeral]
        });
    } else {
        const referentRoleID = Client.settings.referentRoleID;
        const referentRole = interaction.guild.roles.cache.get(referentRoleID);
        
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`ApproveSpectator_${interaction.user.id}`)
                    .setLabel('Valider la demande')
                    .setStyle(ButtonStyle.Success),
            );

        const embed = new EmbedBuilder()
            .setColor('9bd2d2')
            .setTitle('Demande de mode spectateur')
            .setDescription(`Le bénévole <@${interaction.user.id}> souhaite passer en mode spectateur pour lire les écoutes en cours.\n\nCette demande expire dans 5 minutes.`)
            .setTimestamp();

        const msg = await interaction.channel.send({
            content: referentRole ? `<@&${referentRoleID}>` : null,
            embeds: [embed],
            components: [row]
        });

        interaction.reply({
            content: ':hourglass: | Votre demande a été envoyée aux référents pour validation.',
            flags: [MessageFlags.Ephemeral]
        });

        // Suppression automatique après 5 minutes
        setTimeout(async () => {
            try {
                const fetchedMsg = await interaction.channel.messages.fetch(msg.id).catch(() => null);
                if (fetchedMsg) {
                    await fetchedMsg.delete();
                }
            } catch (e) {
                console.error('Erreur lors de la suppression de la demande de spectateur:', e);
            }
        }, 5 * 60 * 1000);
    }

    async function update(status) {
        let tickets = await Client.Ticket.findAll();
        for (let ticket of tickets) {
            // Pour quitter (status=false), on retire les permissions sur tous les tickets (sauf le sien s'il en a un)
            // Pour entrer (status=true), ce n'est plus géré ici mais dans ApproveSpectator.js après validation.
            if (ticket.attributed !== interaction.user.id) {
                let guild = Client.guilds.cache.get(Client.settings.mainGuildID);
                if (guild) {
                    let channel = await guild.channels.fetch(ticket.channelID).catch(() => null);
                    if (channel) {
                        await channel.permissionOverwrites.create(interaction.member, {
                            ViewChannel: status,
                            SendMessages: false,
                        });
                    }
                }
            }
        }
    }
}