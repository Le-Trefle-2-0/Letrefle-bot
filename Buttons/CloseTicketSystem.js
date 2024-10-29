const {ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle} = require('discord.js');
const moment = require('moment');

module.exports = async (Client, interaction) => {
    if (interaction) {
        let topRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('SelectorLeft')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('◀️'),

                new ButtonBuilder()
                    .setCustomId('IncreaseData')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🔼'),

                new ButtonBuilder()
                    .setCustomId('SelectorRight')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('▶️'),

                new ButtonBuilder()
                    .setCustomId('ConfirmDate')
                    .setEmoji('✅')
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId('NoPlanning')
                    .setLabel('Ne pas planifier')
                    .setStyle(ButtonStyle.Secondary)
            );

        let bottomRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('Nothing1')
                    .setLabel('-')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true),

                new ButtonBuilder()
                    .setCustomId('DecreaseData')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🔽'),

                new ButtonBuilder()
                    .setCustomId('Nothing2')
                    .setLabel('-')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true),

                new ButtonBuilder()
                    .setEmoji('❌')
                    .setCustomId('Cancel')
                    .setStyle(ButtonStyle.Danger)
            );

        let fullDate = moment(new Date()).format('DD/MM/YYYY');
        let numbers = fullDate.split('/')
        let hour = '20:00'
        let time = hour.split(':')

        Client.dateSelector = {
            baseDate: new Date(),
            fullDateFormatted: fullDate,
            data: {
                day: {
                    value: numbers[0],
                    selected: true
                },
                month: {
                    value: numbers[1],
                    selected: false
                },
                year: {
                    value: numbers[2],
                    selected: false
                },
                hour: {
                    value: time[0],
                    selected: false
                },
                minute: {
                    value: time[1],
                    selected: false
                }
            },
            rows: {
                topRow, bottomRow
            }
        }

        Client.dateSelector.genText = () => {
            let text = `${Client.dateSelector.data.day.selected ? `\`${Client.dateSelector.data.day.value}\`/` : `${Client.dateSelector.data.day.value}/`}`
            text += `${Client.dateSelector.data.month.selected ? `\`${Client.dateSelector.data.month.value}\`/` : `${Client.dateSelector.data.month.value}/`}`
            text += `${Client.dateSelector.data.year.selected ? `\`${Client.dateSelector.data.year.value}\`` : `${Client.dateSelector.data.year.value}`}`

            text += ' - '
            text += `${Client.dateSelector.data.hour.selected ? `\`${Client.dateSelector.data.hour.value}\`` : `${Client.dateSelector.data.hour.value}`}:`
            text += `${Client.dateSelector.data.minute.selected ? `\`${Client.dateSelector.data.minute.value}\`` : `${Client.dateSelector.data.minute.value}`}`

            return text;
        }

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('9bd2d2')
                    .setDescription(`
                    🍀 | Quelle est la date de la prochaine permanence ?
                    
                    ▶️ | ${Client.dateSelector.genText()}`)
            ], components: [topRow, bottomRow]
        });

        let available = await Client.available.findAll();

        for (let i in Object.keys(available)) {
            await available[i].destroy();
        }

        Client.functions.updateAvailable(Client)
    }
}
