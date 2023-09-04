import {Server} from 'socket.io';
import SimpleSchema from 'simpl-schema';
import order from '../models/order.js';
import helpers from '../utils/helpers.js';
import mongoose from 'mongoose';


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
    io.on('connection', async(socket) => {

        let newOrder = [];
        let preparing = [];
        let completed = [];
        let delivered = [];
        
        socket.emit('connected', 'Connected! Please subscribe to register event now!');


        // adding socket data here

        let orders = await order.find({
            subscriptionType : mongoose.Types.ObjectId('642a6f6e17dc8bc505021545')
        }).lean()
        await Promise.all(orders.map(async(e) =>{
                    let orderstatus = await helpers.getOrderById(e);
                    console.log("Order Statu")

                    console.log(orderstatus);
                    if(orderstatus.orderStatus == 'new')
                    {
                        console.log(orderstatus.orderStatus)
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
        let data = {newOrder:newOrder,preparing : preparing,completed:completed,delivered:delivered} 

        socket.emit('orders',data);
        socket.on('orders', async(response) =>{
            
            // this socket is responsible to fetch all orders that are new

            let newOrder = [];
        let preparing = [];
        let completed = [];
        let delivered = [];
        
        socket.emit('connected', 'Connected! Please subscribe to register event now!');


        // adding socket data here

        let orders = await order.find({
            subscriptionType : mongoose.Types.ObjectId('642a6f6e17dc8bc505021545')
        }).lean()
        await Promise.all(orders.map(async(e) =>{
                    let orderstatus = await helpers.getOrderById(e);
                    console.log("Order Statu")

                    console.log(orderstatus);
                    if(orderstatus.orderStatus == 'new')
                    {
                        console.log(orderstatus.orderStatus)
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
        let data = {newOrder:newOrder,preparing : preparing,completed:completed,delivered:delivered} 

        socket.emit('orders',data);
              
            

        })

        socket.on('prepare', async(response) =>{
            
            // this socket is responsible to fetch all orders that are new
            try
            {
                let data = await order.find({orderStatus:"preparing"}).lean()
                socket.emit('orders', data);}
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