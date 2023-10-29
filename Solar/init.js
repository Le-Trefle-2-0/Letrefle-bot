const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const tough = require('tough-cookie');

module.exports = async (Client) => {
    const jar = new tough.CookieJar();

    axios.post(`${process.env.SOLAR_API}auth/login`, {
        email: process.env.SOLAR_USERNAME,
        password: process.env.SOLAR_PASSWORD
    }).then((response) => {
        console.log(response.data)
        jar.setCookie("session="+JSON.stringify(response.data), process.env.SOLAR_API)
    });

    Client.Solar = await wrapper(axios.create({ 
        baseURL: process.env.SOLAR_API,
        jar,
        withCredentials: true,
    }));

    require('./RaiseSocket')();
    require('./WebSocket').connect(Client);
    require('../TicketUtility/UpdateServiceOpening')(Client);

    Client.Solar.crypto = require('./encryptionService');
}