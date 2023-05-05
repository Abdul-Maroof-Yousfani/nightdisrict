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
            try
            {
                let newOrder = await order.find({orderStatus:"new"}).lean()
                let completed = await order.find({orderStatus:"completed"}).lean()
                let delivered = await order.find({orderStatus:"delivered"}).lean()
                let data = [ {new:newOrder,completed,delivered} ]
                console.log(data);
                socket.emit('data', data);
            }
            catch(error)
            {
                console.log(error)
                socket.emit('error', error.messgae);
            }   
            

        })

        socket.on('prepare', async(response) =>{
            
            // this socket is responsible to fetch all orders that are new
            try
            {
                let data = await order.find({orderStatus:"preparing"}).lean()
                console.log(data);
                socket.emit('data', data);
            }
            catch(error)
            {
                socket.emit('error', error.messgae);
            }   
            

        })
        socket.on('completed', async(response) =>{
            
            // this socket is responsible to fetch all orders that are new
            try
            {
                let data = await order.find({orderStatus:"completed"}).lean()
                console.log(data);
                socket.emit('data', data);
            }
            catch(error)
            {
                socket.emit('error', error.messgae);
            }   
            

        })
        socket.on('delivered', async(response) =>{
            
            // this socket is responsible to fetch all orders that are new
            try
            {
                let data = await order.find({orderStatus:"delivered"}).lean()
                socket.emit('data', data);
            }
            catch(error)
            {
                socket.emit('error', error.messgae);
            }   
            

        })

    });

}

export default { initOrder };