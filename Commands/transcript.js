const {createTranscript} = require('discord-html-transcripts');
const {EmbedBuilder} = require('discord.js');

module.exports = {
    description: 'Génere un transcript du salon',
    options: [],
    run: async (Client, interaction) => {
        if (!interaction.member.permissions.has('MANAGE_MESSAGES')) return interaction.reply({
            embeds: [
                new Client.embed()
                    .setColor('db3226')
                    .setDescription(':x: | Vous n\'avez pas la permission d\'utiliser cette commande.')
            ], ephemeral: true
        });

        await interaction.deferReply({ ephemeral: true });

        let transcript = await createTranscript(interaction.channel, {
            filename: `${interaction.channel.name}.html`,
            saveImages: true,
            footerText: 'Transcript généré par le bot Le Trefle 2.0',
            poweredBy: false
        });

        interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor('db3226')
                    .setDescription(`:white_check_mark: | Le transcript du salon a été généré avec succès.`)
            ], files: [transcript], ephemeral: true
        });
    }

}
