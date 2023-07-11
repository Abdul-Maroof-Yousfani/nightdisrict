// Global Emitter Socket
function sendSignal(req, res) {
    if (res?.evt === null || res?.message === null) throw new Error("Please satisfy the sendSignal schema to proceed");
    const io = req.app.get('socket');
    io.emit(res.evt, res.message);
};

// Global Emitter Socket

function sendSignalSpecifically(req, res) {
    if (res?.evt === null || res?.message === null) throw new Error("Please satisfy the sendSignalSpecifically schema to proceed");
    const io = req.app.get('socket');
    io.to(res._id).emit(res.evt, res.message);
};

module.exports = {
    sendSignal,
    sendSignalSpecifically
};