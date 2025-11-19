const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    description: "Lister les utilisateurs ayant un rôle donné (ID et nom d'utilisateur)",
    options: [
        {
            name: 'rôle',
            type: 'role',
            desc: 'Rôle dont vous souhaitez lister les membres',
            required: true
        }
    ],
    run: async (Client, interaction) => {
        const role = interaction.options.getRole('rôle');
        if (!role) return interaction.reply({
            embeds: [
                new EmbedBuilder().setColor('db3226').setDescription(':x: | Merci de préciser un rôle valide.')
            ],
            ephemeral: true
        });

        await interaction.deferReply({ ephemeral: true });

        const guild = interaction.guild;
        if (!guild) return interaction.editReply({
            embeds: [new EmbedBuilder().setColor('db3226').setDescription(':x: | Cette commande doit être utilisée dans un serveur.')]
        });

        // Ensure member cache is sufficiently populated
        try {
            await guild.members.fetch();
        } catch (e) {}

        // Collect members with the role
        const membersWithRole = guild.members.cache.filter(m => m.roles.cache.has(role.id));

        if (membersWithRole.size === 0) {
            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('db3226')
                        .setDescription(`:x: | Aucun membre n'a le rôle <@&${role.id}>.`)
                ]
            });
        }

        // Prepare rows: [id, username]
        const rows = membersWithRole.map(m => [m.id, m.user?.username || '']).sort((a, b) => a[0].localeCompare(b[0]));

        // Pagination (25 per page)
        const pageSize = 25;
        const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));

        const pages = [];
        for (let i = 0; i < totalPages; i++) {
            const slice = rows.slice(i * pageSize, (i + 1) * pageSize);
            // Build a code block table with two columns
            const lines = [ 'discord_id | username' , '-----------------------' ];
            for (const [id, username] of slice) {
                lines.push(`${id} | ${username}`);
            }
            const description = '```\n' + lines.join('\n') + '\n```';

            pages.push(
                new EmbedBuilder()
                    .setColor('9bd2d2')
                    .setTitle(`Membres avec le rôle ${role.name} (${membersWithRole.size})`)
                    .setDescription(description)
                    .setFooter({ text: `Page ${i + 1}/${totalPages}` })
            );
        }

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('PreviousPage').setLabel('Page précédente').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('NextPage').setLabel('Page suivante').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('RoleUsersCSV').setLabel('Générer CSV').setStyle(ButtonStyle.Primary)
        );

        await interaction.editReply({ embeds: [pages[0]], components: [row] });

        const message = await interaction.fetchReply();
        if (!Client.pages) Client.pages = {};
        Client.pages[message.id] = { pages, pageNumber: 0, data: rows, name: `role-${role.id}` };

        setTimeout(() => {
            if (Client.pages && Client.pages[message.id]) delete Client.pages[message.id];
        }, 300000); // 5 minutes
    }
};