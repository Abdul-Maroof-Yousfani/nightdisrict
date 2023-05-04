import {Server} from 'socket.io';
import SimpleSchema from 'simpl-schema';
import order from '../models/order.js';


const messageSchema = new SimpleSchema({
    bar: String,
    customer: String,
}).newContext();

//  The file belongs to the Real time Order management b/w Bartender and User Application buying drinks from the Bar on real time

function initOrder() {
    const io = new Server(5401, {
        cors: {
            origin: '*'
        }
    });
    io.on('connection', (socket) => {
        
        socket.emit('connected', 'Connected! Please subscribe to register event now!');

        socket.on('orders', async(response) =>{
            
            // this socket is responsible to fetch all orders that are new

            let data = await order.find({}).lean()

        })
        

    });

}

export default { initOrder };