const {get} = require('axios')

module.exports = (Client, userID) => {
    return new Promise(async (resolve, reject) => {
        await Client.Solar.get(`listens/findByUser/${userID}`).then((res) => {
            if (res.data == null || res.data == "" || res.data == undefined || res.data.listen_status_id >= 3) reject(false);
            console.log(res.data)
            resolve(res.data);
        });
    });
}