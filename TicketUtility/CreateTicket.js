const {post} = require('axios')

module.exports = async (user_discord_id_encrypted, is_user_minor) => {
    return new Promise(async (resolve, reject) => {
        await post(`${process.env.SOLAR_API}/listens/open`, {
            user_discord_id_encrypted, is_user_minor,
            user_age_encrypted: '0',
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