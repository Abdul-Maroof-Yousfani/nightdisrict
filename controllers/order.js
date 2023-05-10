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

const store = async (req, res) => {
    let {subscriptionType,items,transactionId,paymentStatus,invoice_url,customer,paymentMethod,cardDetail,tip,type,bar} = req.body;
    let paymentCode,cardId;
    let orderNo  = Math.floor(Math.random() * 10000000);
    try
    {
        const orderSchema = Joi.object({
            subscriptionType:Joi.string().required(),
            items: Joi.array().required(),
            price : Joi.string(),
            type : Joi.string(),
            bar : Joi.string(),
            transactionId:Joi.string().required(),
            paymentStatus:Joi.string(),
            invoice_url:Joi.string(),
            paymentMethod : Joi.string(),
            tip : Joi.number()
            // cardDetail : Joi.object().unknown(true).required(),
        }); 
        
        
        
        const {error} = orderSchema.validate(req.body);
        if(error) return res.status(400).json({ message : error.message ,  data : {}   })


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
        paymentCode = paymentCode.code
        subscriptionType = paymentCode._id

      
        // check Customers


        let amountPaid = 0;
        
        items.map((e) =>{
            amountPaid += Number(e.price)
        })


        // let transactionExist = await Payment.findOne({transactionId: transactionId}).lean()
        // if(transactionExist) return res.json({message : "Order Already Exists",payment : {}})
    
        let orderData = await new Order(
            {subscriptionType,
            orderNo,
            items,
            customer : req.user._id,
            tip,
            type,
            bar : mongoose.Types.ObjectId(bar)

        }
        );
        orderData.save();

        if(orderData)
        {
            let order = orderData.id;

    
            let paymentData = {
                order,
                userId  : req.user._id,
                transactionId,
                amountPaid,
                paymentMethod,
                invoice_url,
            }
            const payment = await new  Payment(paymentData)
            payment.save();

                

        
            if(payment)
            {

                // send user an email

                let userData = await User.findById({_id:mongoose.Types.ObjectId(customer)}).lean();
                
                // let response = await helper.sendSubscriptionEmail(userData.email);
                

                // update user subscription status and membership
                // check item is a membership plan
                let checkMembership = await membership.findOne({_id: items[0].item}).lean()
                if(paymentCode == "buy_membership")
                {
                    let paymentDetail = await User.findByIdAndUpdate({_id:req.user._id},{$set:{paymentStatus:"paid", membership:items[0].item}}).lean()
                        await membership.findByIdAndUpdate({_id: items[0].item},{$push : {subscriptions:[{user:mongoose.Types.ObjectId(customer)}]}})
                    }
                
                    await User.findByIdAndUpdate({
                        _id : req.user._id
                    },{$set : { "currently_active_card" : cardId } })
                
               
                return res.json({
                    message  : "Success",
                    data : payment
                })
            }
    
        }
    }   
    catch(error)
    {   
        console.log(error)
        res.status(500).json({message:error.message})
    }
}

const show = async(req,res) =>
{

}

export default {
    store,
    show
}