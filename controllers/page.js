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
import QRCode  from 'qrcode';
import order from '../models/order.js';
import page from '../models/page.js';

const store = async (req, res) => {
    let {title,slug,description} = req.body;
    try
    {
        const pageSchema = Joi.object({
            title:Joi.string().required(),
            slug: Joi.string().required(),
            description : Joi.string().required()
        }); 
        
        
        
        const {error} = pageSchema.validate(req.body);
        if(error) return res.status(200).json({ status:400, message : error.message ,  data : {}   })


  
        // Check Payment Types
        let data = new page(req.body);
        data = await data.save();

        return res.status(200).json({ status: 200 ,  message : "success",  data })


    }   
    catch(error)
    {   
        res.status(200).json({ status: 500,  message : error.message ,  data : {} })
    }
}
const find = async (req, res) => {
    let {slug} = req.params;

    try
    {
        let data = await page.findOne({
            slug
        })
        
        
        return res.json({
            status : 200,
            message  : "Success",
            data
            })
        
    
    }   
    catch(error)
    {   
        res.status(200).json({ status : 500 , message:error.message})
    }
}
const faqs = async (req, res) => {
    let {slug} = req.params;

    try
    {
        let data = [
            {
                "question": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
                "answer": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod"
            },
            {
                "question": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
                "answer": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod"
            },
            {
                "question": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
                "answer": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod"
            }
        ]
        
        return res.json({
            status : 200,
            message  : "Success",
            data
            })
        
    
    }   
    catch(error)
    {   
        res.status(200).json({ status : 500, message:error.message})
    }
}

export default {
    store,
    find,
    faqs
}