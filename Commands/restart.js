const {MessageEmbed, MessageActionRow, MessageButton} = require('discord.js');
const {exec} = require('child_process');

module.exports = {
    description: 'Redémarrer le bot',
    options: [],
    run: async (Client, interaction) => {
        if (interaction.user.id == '369564132770578432') {
            exec(`forever restart index.js`, (err, stdout, stderr) => {
                if (err) {
                    interaction.reply({
                        content: 'Erreur lors du redémarrage du bot :\n```diff\n' + err + '```',
                        ephemeral: true
                    });
                    console.error(err);
                    return;
                }
            });
        }
    }
}
