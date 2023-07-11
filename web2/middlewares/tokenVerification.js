const jwt = require('jsonwebtoken');

const protectedAuth = (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
        return res.status(401).json({
            status: 'error',
            message: 'You must be logged in!'
        });
    }
    try {
        req.token = authorization.split(" ")[1];
        // console.log(req.token);
        jwt.verify(req.token, process.env.JWT_SECRET, (err, authData) => {
            if (err) {
                return res.status(401).json({ status: "error", message: "Malformed sign-in token! Please use a valid sign-in token to continue.", data: null });
            }
            req.user = authData;
            next();
        });
    }
    catch (err) {
        res.status(401).json({
            status: 'error',
            message: err.message
        });
        console.log(err);
    }
}

module.exports = {
    protectedAuth
}