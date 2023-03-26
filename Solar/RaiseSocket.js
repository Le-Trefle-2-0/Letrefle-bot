const {get} = require('axios');

module.exports = async () => {
    await get(`${process.env.SOLAR_API}/socket`).then((res) => {
        console.log(res.data);
    });
}