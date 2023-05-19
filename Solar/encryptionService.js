const CryptoJS = require("crypto-js");

module.exports = {
    encrypt: (message) => {
        return CryptoJS.AES.encrypt(message, process.env.SOLAR_ENCRYPTION_KEY).toString();
    },
    decrypt: (message) => {
        return CryptoJS.AES.decrypt(message, process.env.SOLAR_ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
    }
}