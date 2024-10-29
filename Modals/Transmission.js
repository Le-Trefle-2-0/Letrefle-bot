const {EmbedBuilder} = require('discord.js')

module.exports = async (Client, interaction) => {
    let transmissionServer = await Client.guilds.fetch(Client.settings.transmissions.serverID);
    if (transmissionServer) {
        let transmissionChannel = await transmissionServer.channels.cache.get(Client.settings.transmissions.channelID);
        if (transmissionChannel) {
            // let username = interaction.user.username;
            let guildMember = await interaction.guild.members.fetch(interaction.user.id);
            let username = guildMember.nickname || interaction.user.username;
            transmissionChannel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor('9bd2d2')
                        .setAuthor({ name: `${username} - ${interaction.user.id}`, iconURL: interaction.user.avatarURL() })
                        .setDescription(`**Numéro de l'écoute :** ${interaction.channel.name}\n\n**Problématique de l'écoute :**\n${interaction.fields.getTextInputValue('problematic')}\n\n**Observations générales :**\n${interaction.fields.getTextInputValue('impressions')}${interaction.fields.getTextInputValue('suplement') ? `\n\n**Informations supplémentaires :**\n${interaction.fields.getTextInputValue('suplement')}` : ''}`)
                ]
            });

            interaction.reply({
                content: 'Ce salon va maintenant être fermé.',
                ephemeral: true
            });

            setTimeout(() => {
                interaction.channel.delete();
            }, 5000);
        }
    }
}
