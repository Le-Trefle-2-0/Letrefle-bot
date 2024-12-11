const {EmbedBuilder, ActionRowBuilder, ButtonBuilder} = require('discord.js');
const ms = require('ms');
const { Op } = require('sequelize');
const crypto = require('crypto');
const { listenerCount } = require('process');

module.exports = {
    description: 'Générer le rapport de permanence',
    options: [],
    run: async (Client, interaction) => {
        await interaction.deferReply();
        let browseStartDate;
        let currDate = new Date();
        let currHour = currDate.getHours();
        if (currHour < 20) {
            currDate = new Date(currDate.getTime() - 86400000);
        }
        currDate.setHours(20, 0, 0, 0);
        browseStartDate = currDate.getTime();

        let historic = await Client.Historic.findAll({
            where: {
                closeTimestamp: {
                    [Op.gt]: (browseStartDate)
                }
            }
        });

        if (historic.length == 0) {
            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('db3226')
                        .setDescription(':x: | Aucune écoute n\'a été trouvée.')
                ]
            });
        }
        
        let tickets = {};
        historic.forEach(listen => {
            if (listen.attributed) {
                if (tickets[listen.attributed]) {
                    tickets[listen.attributed].push(listen);
                } else {
                    tickets[listen.attributed] = [listen];
                }
            } else {
                if (tickets['unattributed']) {
                    tickets['unattributed'].push(listen);
                } else {
                    tickets['unattributed'] = [listen];
                }
            }
        });

        let string = '';
        let endString = '';
        for (let user in tickets) {
            let userTickets = tickets[user];
            if (userTickets[0].attributed) {
                userTickets = userTickets.sort((a, b) => b.openTimestamp - a.openTimestamp);
                let userString = `<@${userTickets[0].attributed}> (${userTickets.length} écoutes)\n`;
                userTickets.forEach(ticket => {
                    userString += `Écoute ${ticket.id} - ${ms(ticket.closeTimestamp - ticket.openTimestamp, {long: true})}\n`;
                });
                string += userString + '\n';
            } else {
                userTickets = userTickets.sort((a, b) => b.openTimestamp - a.openTimestamp);
                let userString = '';
                userTickets.forEach(ticket => {
                    userString += `Écoute ${ticket.id} - ${ms(ticket.closeTimestamp - ticket.openTimestamp, {long: true})}\n`;
                });
                endString += `**Non attribuées :** (${userTickets.length})\n${userString}\n`;
            }
        };

        interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor('9bd2d2')
                    .setTitle(`Rapport de permanence du ${new Date(browseStartDate).toLocaleDateString()} - Total : ${historic.length} écoutes`)
                    .setDescription(`${string}${endString}`)
            ]
        });
    }
}