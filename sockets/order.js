import {Server} from 'socket.io';
import SimpleSchema from 'simpl-schema';
import order from '../models/order.js';
import helpers from '../utils/helpers.js';
import mongoose from 'mongoose';
import { response } from 'express';


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

        let currentUser = socket.handshake.query.userid;
        let barId = socket.handshake.query.barId;
        currentUser = await helpers.getUserById(currentUser)
        // get bar info
        
        let bar = await helpers.getBarData(barId)

        
        socket.emit('connected', 'Connected! Please subscribe to register event now!');


        // adding socket data here

        let orders = await order.find({
            subscriptionType : mongoose.Types.ObjectId('642a6f6e17dc8bc505021545'),
            bar : barId
        }).lean()
        await Promise.all(orders.map(async(e) =>{
            let orderstatus = await helpers.getOrderById(e);
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
        socket.on('myOrders',async(response) =>{
            try
            {
                let customer = response.customer;

                let orders = await order.find({
                    subscriptionType : mongoose.Types.ObjectId('642a6f6e17dc8bc505021545'),
                    customer : customer
                }).lean()
                await Promise.all(orders.map(async(e) =>{
                    let orderstatus = await helpers.getOrderById(e);
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
                socket.emit('myOrders',data);
            }
            catch(error)
            {
                socket.emit('error',error.message);
            }
        })
        socket.on('onPrepare', async(response) =>{

            try
            {
                let updateOrder = await order.findByIdAndUpdate({
                    _id  : response.orderid
                },{
                    $set : {
                        orderStatus : "preparing",
                        estimatedTime : response.estimatedTime
                    }
                },{
                    new :true
                })

                // set a push notification to the User


                // ending a push notification to the user


                let orders = await order.find({
                    subscriptionType : mongoose.Types.ObjectId('642a6f6e17dc8bc505021545'),
                    bar : response.bar
                }).lean()
                await Promise.all(orders.map(async(e) =>{
                    let orderstatus = await helpers.getOrderById(e);
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

            }
            catch(error)
            {
                console.log(error);
            }

        })

        socket.on('orderStatus', async(response) =>{

            try
            {
                let orderStatus  = order


            }
            catch(error)
            {
                console.log(error);
            }

        })

        socket.on('orderById', async(response) =>{

            try
            {
                let orderData = await order.findById({
                    _id  : response.id
                }).lean()
                orderData = await helpers.getOrderById(orderData)

                // set a push notification to the User

                socket.emit('order',orderData);

                

            }
            catch(error)
            {
                socket.emit('error',error.message);
            }

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