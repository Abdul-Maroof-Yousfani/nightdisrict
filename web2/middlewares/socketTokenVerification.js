const jwt = require('jsonwebtoken');

const socketProtected = async (socket, next) => {
    const token = socket.handshake?.auth?.token;
    if (token) {
        try {
            const isTokenValid = jwt.decode(token, process.env.JWT_SECRET);
            if (!isTokenValid) {
                console.log(token);
                socket.emit('conflict', 'Not Authoriuzed');
                return next({
                    status: 'error',
                    message: 'Please sign-in again to continue'
                });
            }
            jwt.verify(token, process.env.JWT_SECRET, (err, authData) => {
                if (err) {
                    socket.emit('conflict', 'Malformed sign-in token! Please use a valid sign-in token to continue.');
                    return next({
                        status: 'error',
                        message: 'Malformed sign-in token! Please use a valid sign-in token to continue.'
                    });
                }
                socket.user = authData;
                next();
            });
        } catch (err) {
            socket.emit('conflict', err.message);
            return next(new Error(err));
        }
    } else {
        socket.emit('conflict', 'Not Authorized!');
        return next(new Error({
            status: 'error',
            message: 'Please sign-in again to continue!'
        }))
    }
}

module.exports = {
    socketProtected
}