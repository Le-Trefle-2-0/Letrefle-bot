module.exports = async (Client, interaction) => {
    interaction.message.delete();

    // Refresh dashboard to be sure it is up to date
    let currentStatus = await Client.user.presence.status;
    if (currentStatus === 'dnd') {
        let reopen = await Client.reOpen.findAll();
        let timestamp = reopen.length > 0 ? reopen[0].timestamp : null;
        Client.functions.close(Client, timestamp);
    } else {
        Client.functions.open(Client);
    }
}