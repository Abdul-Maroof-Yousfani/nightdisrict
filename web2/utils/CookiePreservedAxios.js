const axios = require('axios');
const { CookieJar } = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

function CookiePreservedAxios() {
    const jar = new CookieJar();

    const client = wrapper(axios.create({ jar }));

    return client;
}
const AXIOS = CookiePreservedAxios();
module.exports = AXIOS;