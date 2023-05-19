const {get, put} = require('axios')
const sendMessage = require('./sendMessage');

module.exports = async (Client, userID) => {
    return new Promise(async (resolve, reject) => {
        await get(`${process.env.SOLAR_API}/listens/findByUser/${userID}`).then(async (listenRes) => {
            if (listenRes.data == null || listenRes.data == "" || listenRes.data == undefined || listenRes.data.listen_status_id >= 3) reject(false);
            console.log(listenRes.data)
            await put(`${process.env.SOLAR_API}/listens/${listenRes.data.id}`, {
                listen_status_id: 3
            }).then((res) => {
                sendMessage(Client, 'L\'écoute a été fermée par l\'utilisateur.', userID)
                resolve(res.data);
            });
        });
    });
}