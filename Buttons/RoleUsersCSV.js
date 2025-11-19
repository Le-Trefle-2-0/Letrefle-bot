const { EmbedBuilder, AttachmentBuilder } = require('discord.js');

module.exports = async (Client, interaction) => {
    if (!Client.pages) return interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setColor('db3226')
                .setDescription(':x: | Ce navigateur a expiré, merci de recommencer.')
        ],
        ephemeral: true
    });

    const pager = Client.pages[interaction.message.id];
    if (!pager || !pager.data) return interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setColor('db3226')
                .setDescription(':x: | Impossible de générer le CSV. Merci de relancer la commande.')
        ],
        ephemeral: true
    });

    // Build CSV content: headers then rows
    const header = 'discord_id,username\n';
    const body = pager.data.map(([id, username]) => {
        // Escape quotes and commas
        const safeUser = '"' + (username || '').replace(/"/g, '""') + '"';
        return `${id},${safeUser}`;
    }).join('\n');

    const csv = header + body + '\n';

    try {
        const buffer = Buffer.from(csv, 'utf8');
        const fileName = (pager.name ? pager.name + '-' : '') + 'users.csv';
        const attachment = new AttachmentBuilder(buffer, { name: fileName });
        return interaction.reply({ files: [attachment], ephemeral: true });
    } catch (e) {
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('db3226')
                    .setDescription(':x: | Une erreur est survenue lors de la génération du CSV.')
            ],
            ephemeral: true
        });
    }
};