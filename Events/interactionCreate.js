module.exports = async (Client, interaction) => {
    if (interaction.isButton()) {
        let button = Client.buttons.get(interaction.customId);

        if (button) button(Client, interaction);
    }

    if (interaction.isSelectMenu()) {
        let menu = Client.menus.get(interaction.customId);

        if (menu) menu(Client, interaction);
    }

    if (interaction.isCommand()) {
        let command = Client.commands.get(interaction.commandName)

        if (command) {
            command.run(Client, interaction)
        }
    }

    if (interaction.isModalSubmit()) {
        let modal = Client.modals.get(interaction.customId);

        if (modal) modal(Client, interaction);
    }
}