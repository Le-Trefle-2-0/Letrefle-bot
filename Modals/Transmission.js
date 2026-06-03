const {EmbedBuilder} = require('discord.js')

module.exports = async (Client, interaction) => {
    let transmissionServer = await Client.guilds.fetch(Client.settings.transmissions.serverID);
    if (transmissionServer) {
        let transmissionChannel = await transmissionServer.channels.cache.get(Client.settings.transmissions.channelID);
        if (transmissionChannel) {
            // let username = interaction.user.username;
            let guildMember = await interaction.guild.members.fetch(interaction.user.id);
            let username = guildMember.nickname || interaction.user.username;
            let categories = [];
            try {
                // Récupération des valeurs du menu de sélection "categories"
                categories = interaction.fields.getStringSelectValues('categories') || [];
            } catch (e) {
                // Si le menu n'est pas présent ou n'a pas été sélectionné
                console.error('Erreur lors de la récupération des catégories dans le modal:', e);
                categories = [];
            }

            transmissionChannel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor('9bd2d2')
                        .setAuthor({ name: `${username} - ${interaction.user.id}`, iconURL: interaction.user.avatarURL() })
                        .setDescription(`**Numéro de l'écoute :** ${interaction.channel.name.split('・')[1] || interaction.channel.name}\n\n**Catégories :** ${categories.length > 0 ? categories.join(', ') : 'Aucune'}\n\n**Problématique de l'écoute :**\n${interaction.fields.getTextInputValue('problematic')}\n\n**Observations générales :**\n${interaction.fields.getTextInputValue('impressions')}${interaction.fields.getTextInputValue('suplement') ? `\n\n**Informations supplémentaires :**\n${interaction.fields.getTextInputValue('suplement')}` : ''}`)
                ]
            });

            interaction.reply({
                content: 'Ce salon va maintenant être fermé.',
                ephemeral: true
            });

            let ticketID = interaction.channel.name.split('・')[1] || interaction.channel.name;
            let historic = await Client.Historic.findOne({ where: { ticketID: ticketID } });
            if (historic) {
                await historic.update({
                    problematic: interaction.fields.getTextInputValue('problematic'),
                    observations: interaction.fields.getTextInputValue('impressions'),
                    complement: interaction.fields.getTextInputValue('suplement'),
                    categories: JSON.stringify(categories),
                });
            }

            setTimeout(() => {
                interaction.channel.delete();
            }, 5000);
        }
    }
}
