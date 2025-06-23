require('dotenv').config();
require('./Utility/StartCheck')();

let Client = {};
Client.Discord = require('./Bot').login();
Client.log = require('./Utility/console');
Client.settings = require('./settings.json')
Client.Solar = {};

require('./Solar/socket').init(Client);
// require('./Solar/init')(Client)

require('./Handlers/initHandlers')(Client);