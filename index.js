require('dotenv').config();
require('./Utility/StartCheck')();

let Client = {};
Client.Discord = require('./Bot').login();
Client.log = require('./Utility/console');

require('./Solar/init')(Client)

require('./Handlers/initHandlers')(Client);
