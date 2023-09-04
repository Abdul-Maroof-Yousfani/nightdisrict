import {Server} from 'socket.io';
import SimpleSchema from 'simpl-schema';
import order from '../models/order.js';
import helpers from '../utils/helpers.js';


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
            let newOrder = []
            let totalOrders = []
            let completed = []
            let delivered = []
            let preparing = []
            try
            {
                let orders = await order.find({}).lean()
                await Promise.all(orders.map(async(e) =>{
                    let orderstatus = await helpers.getOrderById(e);
                    if(orderstatus.orderStatus == 'new')
                    {
                        newOrder.push(orderstatus)
                    }
                    if(orderstatus.orderStatus == 'preparing')
                    {
                        preparing.push(orderstatus)
                    }
                    if(orderstatus.orderStatus == 'completed')
                    {
                        completed.push(orderstatus)
                    }
                    if(orderstatus.orderStatus == 'delivered')
                    {
                        delivered.push(orderstatus)
                    }
                }))
                let data = {newOrder,preparing,completed,delivered} 
                socket.emit('orders', data);
            }
            catch(error)
            {
                socket.emit('error', error.messgae);
            }   
            

        })

        socket.on('prepare', async(response) =>{
            
            // this socket is responsible to fetch all orders that are new
            try
            {
                let data = await order.find({orderStatus:"preparing"}).lean()
                socket.emit('orders', data);            }
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
                socket.emit('orders', data);
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
                socket.emit('orders', data);

            }
            catch(error)
            {
                socket.emit('error', error.messgae);
            }   
            

        })

    });

}

export default { initOrder };