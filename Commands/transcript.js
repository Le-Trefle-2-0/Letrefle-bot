const {createTranscript} = require('discord-html-transcripts');
const {EmbedBuilder, MessageFlags} = require('discord.js');

module.exports = {
    description: 'Génere un transcript du salon',
    options: [],
    run: async (Client, interaction) => {
        if (!interaction.member.permissions.has('MANAGE_MESSAGES')) return interaction.reply({
            embeds: [
                new Client.embed()
                    .setColor('db3226')
                    .setDescription(':x: | Vous n\'avez pas la permission d\'utiliser cette commande.')
            ], flags: [MessageFlags.Ephemeral]
        });

        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        let transcript;
        try {
            transcript = await createTranscript(interaction.channel, {
                filename: `${interaction.channel.name}.html`,
                saveImages: true,
                footerText: 'Transcript généré par le bot Le Trefle 2.0',
                poweredBy: false
            });
        } catch (e) {
            console.error('Erreur lors de la génération du transcript:', e);
            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('db3226')
                        .setDescription(`:x: | Une erreur est survenue lors de la génération du transcript.`)
                ], flags: [MessageFlags.Ephemeral]
            });
        }

        interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor('db3226')
                    .setDescription(`:white_check_mark: | Le transcript du salon a été généré avec succès.`)
            ], files: [transcript], flags: [MessageFlags.Ephemeral]
        });
    }

}
