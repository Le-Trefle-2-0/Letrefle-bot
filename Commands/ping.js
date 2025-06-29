const { EmbedBuilder } = require('discord.js');

module.exports = {
    description: 'Display the bot status',
    options: [],
    run: (Client, interaction) => {
        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('#0099ff')
                    .setDescription(`🛰️ | Discord latency: \`${Client.Discord.ws.ping} ms\`
                    💫 | Solar latency: \`${Client.Solar.ping} ms\`
                    🚀 | Up since: <t:${Math.round((Date.now()-Client.Discord.uptime)/1000)}:R>`)
            ]
        })
    }
}