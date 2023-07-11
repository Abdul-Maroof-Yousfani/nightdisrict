const axios = require("./CookiePreservedAxios.js");

const POST = async (url, data = {}, headers = {}) => {
    try {
        const res = await axios.post(
            url,
            data,
            {
                headers,
                validateStatus: status => {
                    // console.log(status);
                    return status >= 200
                }
            }
        );
        return res.data;
    } catch (error) {
        // console.log(error);
        return error;
    }
}

const PUT = async (url, data = {}, headers = {}) => {
    try {
        const res = await axios.put(
            url,
            data,
            {
                headers,
                validateStatus: status => {
                    // console.log(status);
                    return status >= 200
                }
            }
        );
        return res.data;
    } catch (error) {
        // console.log(error);
        return error;
    }
}

const GET = async (url, headers = {}) => {
    try {
        const res = await axios.get(
            url,
            {
                headers,
                validateStatus: status => {
                    // console.log(status);
                    return status >= 200
                }
            }
        );
        return res.data;
    } catch (error) {
        // console.log(error);
        return error;
    }
}

const DELETE = async (url, headers = {}, data = {}) => {
    try {
        const res = await axios.delete(
            url,
            {
                headers,
                data,
                validateStatus: status => {
                    // console.log(status);
                    return status >= 200
                }
            }
        );
        return res.data;
    } catch (error) {
        // console.log(error);
        return error;
    }
}

module.exports = {
    GET,
    POST,
    PUT,
    DELETE
}