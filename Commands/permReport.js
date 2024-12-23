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

        let openTickets = await Client.Ticket.findAll(); 

        if (historic.length == 0 && openTickets.length == 0) {
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
        let startString = '';
        if (openTickets.length > 0) {
            startString = `**Écoutes en cours :** (${openTickets.length})\n`;
        }
        openTickets.forEach(ticket => {
            let newString = `Écoute ${ticket.ticketID} - Ouverte depuis <t:${Math.round(new Date(ticket.createdAt).getTime()/1000)}:R>\n`;
            startString += newString;
        });
        for (let user in tickets) {
            let userTickets = tickets[user];
            if (userTickets[0].attributed) {
                userTickets = userTickets.sort((a, b) => b.openTimestamp - a.openTimestamp);
                let userString = `<@${userTickets[0].attributed}> (${userTickets.length} écoutes)\n`;
                userTickets.forEach(ticket => {
                    userString += `Écoute ${ticket.ticketID} - ${ms(ticket.closeTimestamp - ticket.openTimestamp, {long: true})}\n`;
                });
                string += userString + '\n';
            } else {
                userTickets = userTickets.sort((a, b) => b.openTimestamp - a.openTimestamp);
                let userString = '';
                userTickets.forEach(ticket => {
                    userString += `Écoute ${ticket.ticketID} - ${ms(ticket.closeTimestamp - ticket.openTimestamp, {long: true})}\n`;
                });
                endString += `**Non attribuées :** (${userTickets.length})\n${userString}\n`;
            }
        };

        interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor('9bd2d2')
                    .setTitle(`Rapport de permanence du ${new Date(browseStartDate).toLocaleDateString('fr-FR')} - Total : ${historic.length + openTickets.length} écoutes`)
                    .setDescription(`${startString}${string}${endString}`)
            ]
        });
    }
}