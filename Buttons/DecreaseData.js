const {EmbedBuilder} = require('discord.js');

module.exports = async (Client, interaction) => {
    let months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    Object.keys(Client.dateSelector.data).forEach(data => {
        if (Client.dateSelector.data[data].selected) {
            let value = Client.dateSelector.data[data].value;
            let numValue = parseInt(value)
            switch (data) {
                case 'day':
                    if (numValue <= 1) return Client.dateSelector.data[data].value = months[parseInt(Client.dateSelector.data.month.value)-1].toString();
                    break;

                case 'month':
                    if (numValue <= 1) return Client.dateSelector.data[data].value = '12';
                    break;

                case 'hour':
                    if (numValue <= 1) return Client.dateSelector.data[data].value = '23';
                    break;

                case 'minute':
                    if (numValue <= 0) return Client.dateSelector.data[data].value = '55';
            }
            if (data == 'minute') value = (parseInt(value)-5).toString();
            value = (parseInt(value)-1).toString();
            if (value.length < 2) {
                value = `0${value}`;
            }

            Client.dateSelector.data[data].value = value;
        }
    })

    let text = Client.dateSelector.genText();
    interaction.update({
        embeds: [
            new EmbedBuilder()
                .setColor('9bd2d2')
                .setDescription(`
                        🍀 | Quelle est la date de la prochaine permanence ?
                        
                        ▶️ | ${Client.dateSelector.genText()}`)
        ]
    });
}