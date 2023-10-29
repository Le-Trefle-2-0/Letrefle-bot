const { readdir } = require('fs');

module.exports = (Client) => {
    readdir('./Buttons', (err, files) => {
        if (err) throw err
    
        files.forEach(file => {
            let name = file.split('.')[0];

            Client.Discord.buttons.set(name, require(`../Buttons/${file}`));
        })
    });
}