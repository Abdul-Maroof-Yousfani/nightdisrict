import SimpleSchema from 'simpl-schema';
import menuCategory from "../models/menuCategory.js";
import Role from "../models/roles.js";
import User from "../models/users.js";
import Menu from '../models/menu.js';
import helpers from '../utils/helpers.js';
import Joi from 'joi';
import Payment from '../models/payments.js';
import Order from '../models/order.js';
import mongoose, { mongo } from 'mongoose';
import membership from '../models/membership.js';
import ticket from '../models/ticket.js';
import QRCode from 'qrcode';
import order from '../models/order.js';
import payments from '../models/payments.js';
import allOrders from '../sockets/order.js';
import orderSocket from '../sockets/order.js';
import event from '../models/event.js';
import OrderSequence from '../models/ordersequence.js';


const getNextSequence = async (bar) => {
    const lastOrder = await OrderSequence.findOne({ bar }).sort({ sequence: -1 });

    if (lastOrder) {
        // If there is a last order, increment the sequence
        return lastOrder.sequence + 1;
    } else {
        // Start from 1 if there are no previous orders
        return 1;
    }
};


const markOrderAsDelivered = async (bar, sequence) => {
    await OrderSequence.findOneAndUpdate(
        { bar, sequence },
        { delivered: true }
    );
};

const createNewOrder = async (bar, sequence) => {
    // Create a new OrderSequence document
    const orderSequence = new OrderSequence({
        bar: bar,
        sequence: sequence,
        delivered: false, // Assuming the order is not delivered yet
    });

    // Save the new order sequence document to the database
    await orderSequence.save();
    
    // Create a new order or perform any other necessary actions
    // ...
};


const store = async (req, res) => {
    let { subscriptionType, items, transactionId, paymentStatus, invoice_url, customer, paymentMethod, cardDetail, tip, type, bar, amount  , instruction} = req.body;
    let paymentCode, cardId;
    let orderNo = Math.floor(Math.random() * 10000000);
    let isSwap = false;
    let orderData;
    try {

        const orderSchema = Joi.object({
            subscriptionType: Joi.string().required(),
            items: Joi.array().required(),
            price: Joi.string(),
            amount: Joi.number(),
            type: Joi.string(),
            bar: Joi.string(),
            transactionId: Joi.string().required(),
            paymentStatus: Joi.string(),
            invoice_url: Joi.string(),
            paymentMethod: Joi.string(),
            tip: Joi.number(),
            instruction : Joi.string().allow(''),
            // cardDetail : Joi.object().unknown(true).required(),
        });



        const { error } = orderSchema.validate(req.body);
        if (error) return res.status(200).json({ status : 400, message: error.message, data: {} })


        // check users and see if card exists
        // let cardexists = await User.findOne({"cardDetail.cartNumber" : cardDetail.cardNumber})
        // if(!cardexists)
        // {
        //     cardId = new User({cardDetail})
        //     cardId = await cardId.save()
        //     cardId = cardId._id
        // }
        // else
        // {
        //     cardId = cardexists._id
        // }


        // Check Payment Types

        paymentCode = await helpers.checkPaymentType(subscriptionType);
        subscriptionType = await helpers.checkPaymentType(subscriptionType);

        paymentCode = paymentCode.code
        subscriptionType = subscriptionType._id



        // check Customers


        let amountPaid = 0;
        let totalqty = 0;

        items.map((e) => {
            amountPaid += Number(e.price)
            totalqty += Number(e.qty)
        })

        let totalAmount = amountPaid + tip


      

        let nextSequence = 1; // Initialize the sequence to 1
        let nextBartender = null; // Initialize the nextBartender to an empty string
        let assignedBartender = null; // Initialize the assignedBartender to an empty string
        let bartenders = []




        if (paymentCode === 'buy_drink') {
            // Get all delivered orders

            bartenders = await helpers.getBartenders(bar);

           
            const latestOrder = await helpers.getLatestOrder(bar);
            const lastOrder = await helpers.getLastOrder(bar);

          


            let deliveredOrders = await allOrders.deliveredOrders(bar);

         
            // return res.json(deliveredOrders)
        
            if (deliveredOrders.length > 0) {
                // Sort delivered orders by timestamp in ascending order
                // deliveredOrders.sort((a, b) => a.timestamp - b.timestamp);
        
                // Find the order to swap (it should have the earliest timestamp)
                const orderToSwap = deliveredOrders[0];
    


     
                // Update the delivered order's status to "delivered = false"
                await allOrders.updateOrderStatus(orderToSwap._id, false, latestOrder._id);
        
                // Assign the nextSequence from the order to swap
                nextSequence = orderToSwap.sequence;

                isSwap = true
            }
            else {
                // If there are no delivered orders, assign the sequence based on the latest order
                nextSequence = lastOrder?lastOrder.sequence + 1:1;
        
            }

            
                // Find the index of the current assignedBartender in the bartenders array
                let currentAssignedBartenderIndex = 0
                if(latestOrder)
                {
                    currentAssignedBartenderIndex = bartenders.findIndex(
                        (bartender) => bartender._id.toString() === latestOrder.nextBartender.toString()
                    );
                }
                

     
        
                // Calculate the index of the nextBartender based on the circular pattern
                const nextBartenderIndex = (currentAssignedBartenderIndex + 1) % bartenders.length;
        
                // Set the nextBartender for the new order
                nextBartender = bartenders[nextBartenderIndex]._id;
        
                assignedBartender = bartenders[currentAssignedBartenderIndex]._id;
        }else if (paymentCode === 'buy_ticket'){
            
            const eventId = items[0].item;

            var eventdata = event.findOne({
                _id: eventId
            });
            event.findOneAndUpdate(
                { _id: eventId },
                { $set: { stock: Math.max(0, eventdata.stock - 1) } },
                { new: true },
                
                (err, updatedEvent) => {
                    if (err) {
                    console.error("Error updating event:", err);
                    } else {
                    console.log("Updated Event:", updatedEvent);
                    }
                }
            );
        }

        
        // if (nextSequence === 1) {
        //     // Get the next available sequence if it's a new order
        //     nextSequence = await getNextSequence(bar);
        // }
          
          // Continue with creating the order using assignedBartender and nextBartender
          

        // let transactionExist = await Payment.findOne({transactionId: transactionId}).lean()
        // if(transactionExist) return res.json({message : "Order Already Exists",payment : {}})



        // return res.json({})

       
        orderData = new Order(
            {
                subscriptionType,
                orderNo,
                items,
                customer: req.user._id,
                tip,
                type,
                amount: amountPaid,
                bar: mongoose.Types.ObjectId(bar),
                totalPrice: totalAmount,
                totalQuantity: totalqty,
                instruction,
                nextBartender : nextBartender,
                bartender : assignedBartender,
                sequence : nextSequence,

            }
        );

        let latestdata = await orderData.save();


        if (orderData) {
            let order = orderData.id;

            // create order 

            if(!isSwap)
            {
                let orderSequence = new OrderSequence({
                    bar: bar,
                    sequence: nextSequence,
                    delivered: false, // Assuming the order is not delivered yet
                });
            
                // Save the new order sequence document to the database
                await orderSequence.save();
            }

          


            let paymentData = {
                order,
                userId: req.user._id,
                transactionId,
                amountPaid,
                paymentMethod,
                invoice_url,
            }
            const payment = new Payment(paymentData)
            await payment.save();

            if (payment) {

                // send user an email



                let userData = await User.findById({ _id: mongoose.Types.ObjectId(customer) }).lean();

                // return res.json({
                //     status : 200,
                //     message : 'success',
                //     data : payment,
                //     bartenders
                // })

                // let response = await helper.sendSubscriptionEmail(userData.email);

                // Notification to the user bought the drink

    
                let orderNotification = {
                   
                }


                if(paymentCode == 'buy_drink')
                {
                    // code for socket

                    // lets get list of bartender based on bar id


                    // check the bartender for the sequence to be assigned
                    //  check latest order of the day

                    // if (bartenders.length === 0) {
                    //     return res.status(400).json({ message: 'No bartenders available for this bar.' });
                    // }


                    // 

                    const socket = orderSocket.getIoInstance();

                    let data = await allOrders.allOrders(bar,assignedBartender);
                    socket.emit('orders',data);

                 
                    orderNotification = {
                        title : "New Order Placed",
                        body : `Your order  #${latestdata.orderNo} has been successfully created. Thank you for choosing our service!`,
                        type : "drink_order",
                        notification_for : order,
                        user : req.user._id
                    }
    
                    await helpers.createNotification(orderNotification,req.user)
                }
                if(paymentCode == 'buy_ticket')
                {

                    // get event details

                    let eventData = await event.findById({
                        _id : items[0].item
                    })

                    orderNotification = {
                        title : "Ticket Purchased",
                        body : `You have successfully purchased a ticket for (${eventData.name}). Enjoy the event!`,
                        type : "event_reminder",
                        notification_for : order,
                        user : req.user._id
                    }
                    await helpers.createNotification(orderNotification,req.user)
                }

            


                // update user subscription status and membership
                // check item is a membership plan
                let checkMembership = await membership.findOne({ _id: items[0].item }).lean()
                if (paymentCode == "buy_membership") {
                    let paymentDetail = await User.findByIdAndUpdate({ _id: req.user._id }, { $set: { paymentStatus: "paid", membership: items[0].item } }).lean()
                    await membership.findByIdAndUpdate({ _id: items[0].item }, { $push: { subscriptions: [{ user: mongoose.Types.ObjectId(customer) }] } })
                }
                else if (paymentCode == "buy_ticket") {
                    // store data into the Tickets table, and create nested document in the User

                    // Generate a Unqiue QRCODE!

                    // create a Qr code string, which can be converted to json

                    let jsonData = {
                        user: req.user._id,
                        event: items[0].item,
                        order: order,
                    };

                    jsonData = JSON.stringify(jsonData);

                    // const qrCodeData = req.user._id.toString();
                    const qrCodeImage = await QRCode.toDataURL(jsonData);


                    let tickets = new ticket({
                        "event": items[0].item,
                        "user": req.user._id,
                        "qrcode": qrCodeImage,
                        "order": order,
                        "price": amountPaid
                    })
                    await tickets.save();

                    // Send Notification to the user



                }

                await User.findByIdAndUpdate({
                    _id: req.user._id
                }, { $set: { "currently_active_card": cardId } })



                // call helper to get order information
                let orderData = await Order.findById({ _id: order }).lean();

                orderData = await helpers.getOrderById(orderData)


                return res.json({
                    status : 200,
                    message: "Success",
                    data: orderData
                })
            }

        }
    }
    catch (error) {
        console.log(error);
        res.status(200).json({ status:500, message: error.message })
    }
}

const show = async (req, res) => {
    try {
        let order = await Order.findById(req.params._id).lean();
        // console.log(order);
        order = await helpers.getOrderById(order)
        return res.status(200).json({
            status: 200,
            message: "success",
            data: order
        })

    }
    catch (error) {
        return res.status(200).json({
            status: 500,
            message: error.message,
            data: {}
        })
    }


}
const payment = async (req, res) => {
    try {
        let Order = await order.find({
            customer: req.user._id
        }).lean()
        let results = await helpers.paginate(Order, req.params.page, req.params.limit)
        let data = await Promise.all(results.result.map(async (e) => {
            let order = await helpers.getOrderById(e)

            let transaction = await payments.findOne({
                order: e._id
            }, {
                paymentMethod: 1,
                amountPaid: 1,
                invoiceUrl: 1
            })
            order.transaction = transaction;

            return order;

        }))

        return res.status(200).json({
            status: 200,
            message: "succes",
            data: data,
            paginate: results.totalPages
        })
    }
    catch (error) {
        return res.status(200).json({
            status: 500,
            message: error.message,
            data: []
        })
    }
}
export default {
    store,
    show,
    payment
}