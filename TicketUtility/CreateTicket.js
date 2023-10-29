const {encrypt} = require('../Solar/encryptionService');

module.exports = async (Client, user_discord_id_encrypted, is_user_minor) => {
    return new Promise(async (resolve, reject) => {
        await Client.Solar.post(`listens/create`, {
            user_discord_id_encrypted,
            is_user_minor,
            user_age_encrypted: (is_user_minor ? encrypt('mineur') : (is_user_minor == false ? encrypt('majeur') : encrypt('N/R'))),
            main_subject_encrypted: '',
            date_time_start: new Date(),
            listen_status_id: 1
        }).then((res) => {
            if (!res.data) reject(null);
            resolve(res.data);
        })

        reject(null)
    });
}