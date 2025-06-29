const {openTicket} = require("../Solar/ticketManager");
module.exports = async (Client, interaction) => {
    let ticket = await openTicket(Client, interaction.user.id);
    console.log(ticket);
    interaction.reply({
        content: 'This is an example button!',
        ephemeral: true
    });
}