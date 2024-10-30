const {EmbedBuilder, MessageActionRow, MessageButton} = require('discord.js');
const {exec} = require('child_process');

module.exports = {
    description: 'Informations du bot',
    options: [],
    run: async (Client, interaction) => {
        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('9bd2d2')
                    .setTitle('Informations du bot')
                    .setDescription(`**Uptime :** <t:${Math.round((Date.now()/1000-process.uptime()))}:R>
**Mémoire utilisée :** ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
**Version de Node.js :** ${process.version}
**Latence Discord :** ${Client.ws.ping} ms`)
                    .setThumbnail(Client.user.displayAvatarURL())
            ]
        });
    }
}
