const {EmbedBuilder} = require('discord.js');

module.exports = async (Client, interaction) => {
    let toSelect;
    let i = 0;

    Object.keys(Client.dateSelector.data).forEach(data => {
        i++;
        if (Client.dateSelector.data[data].selected) {
            toSelect = i+1
        }

        Client.dateSelector.data[data].selected = i === toSelect;
    });

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