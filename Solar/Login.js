const {post} = require('axios')

module.exports = () => {
    post(`${process.env.SOLAR_API}/auth/login`, {
        email: process.env.SOLAR_USERNAME,
        password: process.env.SOLAR_PASSWORD
    }).then((response) => {
        console.log(response.data)
    });
}