import {Server} from 'socket.io';
import SimpleSchema from 'simpl-schema';
import order from '../models/order.js';
import helpers from '../utils/helpers.js';
import mongoose from 'mongoose';
import { response } from 'express';
import reviews from '../models/reviews.js';
import menu from '../models/menu.js';
import tournamentLog from '../models/applicationLogs.js';

const messageSchema = new SimpleSchema({
    bar: String,
    customer: String,
}).newContext();

//  The file belongs to the Real time Order management b/w Bartender and User Application buying drinks from the Bar on real time


const myOrders = async(customerId) =>
{
    try
    {
        let customer = customerId;

        let newOrder = [];
        let preparing = [];
        let completed = [];
        let delivered = [];

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
        return data;
    }
    catch(error)
    {
        return error.message;

    }
}

const deliveredOrders = async(bar) =>
{
    try
    {
        let orders = await order.find({
            subscriptionType : mongoose.Types.ObjectId('642a6f6e17dc8bc505021545'),
            bar : bar,
            orderStatus : "delivered"
        }).lean()
        orders  = await Promise.all(orders.map(async(e) =>{
            return  await helpers.getOrderById(e);
        }))
        return orders;
    }
    catch(error)
    {
        return error.message
    }
}

const addReview = async(req) =>
{
    let {item,variation,customer,rating,bar,message,Order} = req
    let body = req

    try
    {
        // check item, if item exists
        
        // get customer from the access token

   
        body.customer = body.user;



        // add dat to the req.body

        let checkMenu = await menu.findOne({
            item,
            barId : bar
        }).lean()

        // check review if already given

        let checkReview = await reviews.findOne({
            customer : body.customer,
            item,
            bar
        })


 
        // if(checkReview) return res.status(409).json({
        //     status : 409,
        //     message : "review already given",
        // })

        


    

        // check menu





      


        // adding a review to  a drink

        let drink = new reviews(body);
        drink = await drink.save();




        // update
        let newData = await menu.findOneAndUpdate({
            item,
            barId: bar
        },
        {
            $push : {
                "reviews" : {
                    customer : customer,
                    review : drink._id
                },
                
            }
        },{
            new: true
        })


        // get drink data

        drink = await reviews.findById({
            _id : drink._id
        }).lean()

        drink = await helpers.getBasicReview(drink)


        return drink
    }
    catch(error)
    {
        console.log(error)
        return res.status(500).json({
            status : 500,
            message : error.message,
            data : {}
        })
    }
}

const allOrders = async(bar) =>
{
    try
    {
        let newOrder = []
        let preparing = []
        let completed = []
        let delivered = []
        let orders = await order.find({
            subscriptionType : mongoose.Types.ObjectId('642a6f6e17dc8bc505021545'),
            bar : bar
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
        return data;
    }
    catch(error)
    {
        return error.message
    }
    

}

let io;

function getIoInstance() {
    if (!io) {
      throw new Error('Socket.io has not been initialized yet.');
    }
    return io;
  }
function initOrder() {
    io = new Server(5401, {
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
        
        // let bar = await helpers.getBarData(barId)

        
        socket.emit('connected', 'Connected! Please subscribe to register event now!');


        // adding socket data here
        // let orders = await order.find({
        //     subscriptionType : mongoose.Types.ObjectId('642a6f6e17dc8bc505021545'),
        //     bar : barId
        // }).lean()
        // await Promise.all(orders.map(async(e) =>{
        //             let orderstatus = await helpers.getOrderById(e);
        //             if(orderstatus.orderStatus == 'new')
        //             {
        //                 console.log(orderstatus.orderStatus)
        //                 newOrder.push(orderstatus)
        //             }
        //             if(orderstatus.orderStatus == 'preparing')
        //             {
        //                 preparing.push(orderstatus)
        //             }
        //             if(orderstatus.orderStatus == 'completed')
        //             {
        //                 completed.push(orderstatus)
        //             }
        //             if(orderstatus.orderStatus == 'delivered')
        //             {
        //                 delivered.push(orderstatus)
        //             }
        //         }))
        // let data = {newOrder:newOrder,preparing : preparing,completed:completed,delivered:delivered} 

        let data = await allOrders(barId)

        socket.emit('orders',data);

        socket.on('devLog',async(response) =>{
            let data = JSON.stringify(response)
            let log = new tournamentLog({
                string: data
            });
            console.log(log)

            log = await log.save();
            socket.emit('devLog',log)
        })


   
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
        console.log(data);
        socket.emit('orders',data);
              
            

        })


        socket.on('myOrders',async(response) =>{
            try
            {
                let customer = response.customerId;
                let data = await myOrders(customer);
                socket.emit('myOrders',data);
                socket.broadcast.emit('myOrders', data);
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
                        orderStatus : response.status,
                        estimatedTime : response.estimatedTime
                    }
                },{
                    new :true
                })
             

                // set a push notification to the User

                let orderStatus  = await order.findById({
                    _id  : updateOrder._id
                })
                let newData = [
                    {
                    status : 1,
                    message : "order recieved",
                    active : orderStatus.orderStatus == 'new'? true : false
                    },
                    {
                        status : 2,
                        message : "preparing your order",
                        active : orderStatus.orderStatus == 'preparing'? true : false
                        },
                    {
                        status : 3,
                        message : "Ready to pickup",
                        active : orderStatus.orderStatus == 'completed'? true : false
                     },
                ];
                
                socket.emit('orderStatus',newData);
                socket.broadcast.emit('orderStatus', newData);




                // ending a push notification to the user
                let customerData = await myOrders(orderStatus.customer)
         
                socket.broadcast.emit('myOrders',customerData);
                socket.emit('myOrders',customerData);

                let allNewOrders =  await allOrders(response.bar)

                
                socket.emit('orders',allNewOrders);
                socket.broadcast.emit('orders', allNewOrders);

            }
            catch(error)
            {
                socket.broadcast.emit('error', error.message);
            }

        })

        socket.on('getBar', async(response) =>{

            try
            {
                let data;
                if(response.bar)
                {
                    data.barData = await helpers.getBarById(response.bar)
                    data.status = response.status
                }
                else
                {
                    data = null
                }

                socket.emit('getBar',data)
                socket.broadcast.emit('getBar',data)
                console.log(data)

            }
            catch(error)
            {   
                socket.emit('error',error.message)
            }

        })


        socket.on('orderStatus', async(response) =>{

            try
            {
                let orderStatus  = await order.findOne({
                    customer  : response.customerId,
                    subscriptionType : mongoose.Types.ObjectId('642a6f6e17dc8bc505021545'),
                }).sort({ updatedAt : -1})
                let data = [
                    {
                    status : 1,
                    message : "order recieved",
                    active : orderStatus.orderStatus == 'new'? true : false
                    },
                    {
                        status : 2,
                        message : "preparing your order",
                        active : orderStatus.orderStatus == 'preparing'? true : false
                        },
                    {
                        status : 3,
                        message : "Ready to pickup",
                        active : orderStatus.orderStatus == 'completed'? true : false
                     },
                ];
                socket.emit('orderStatus',data)


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

  
        socket.on('review', async(response) =>{
            
            // this socket is responsible to fetch all orders that are new
            try
            {
               
                let data = await addReview(response)



                let socketData = await myOrders(response.user)
                let orders = await allOrders(response.bar)
                socket.emit('orders',orders)
                socket.emit('myOrders',socketData)


                socket.broadcast.emit('orders',orders)
                socket.broadcast.emit('myOrders',socketData)

            }
            catch(error)
            {
                socket.emit('error', error.messgae);
            }   
            

        })

    });

}

export default { initOrder,
    getIoInstance };