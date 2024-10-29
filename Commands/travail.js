const {MessageEmbed, MessageActionRow, MessageButton} = require('discord.js');

module.exports = {
    description: 'Obtenir le rôle technicien en travail',
    options: [],
    run: async (Client, interaction) => {
        if (interaction.user.id == '369564132770578432') {
            let mainGuild = Client.guilds.cache.get(Client.settings.mainGuildID);
            if (mainGuild) {
                let user = mainGuild.members.cache.get('369564132770578432');
                let role = mainGuild.roles.cache.get('742671232490799174')
                if (user.roles.cache.has('742671232490799174')) {
                    user.roles.remove('742671232490799174');
                    interaction.reply({
                        content: `Vous n'êtes plus en travail`,
                        ephemeral: true
                    })
                } else {
                    user.roles.add(role);
                    interaction.reply({
                        content: `Vous êtes maintenant en travail`,
                        ephemeral: true
                    })
                }
            }
        }
    }
}
