import bar from "../../models/bar.js";
import inquiry from "../../models/inquiry.js";
import users from "../../models/users.js";
import commonHelper from "../../helpers/commonHelper.js";
import menu from "../../models/menu.js";
import menuCategory from "../../models/menuCategory.js";
import pourtype from "../../models/pourtype.js";
import superMenu from "../../models/superMenu.js";
import order from "../../models/order.js";
import { format, addDays, getWeek, getMonth, startOfMonth, endOfMonth } from 'date-fns';




// admin Panel Routes
// Home Page Functions
const home = async(req,res) =>
{
    let analytics  = []
    try
    {
        let recentMenu = await menuCategory.find({}).limit(4);
        let registeredBars = await bar.find({}).limit(4);
        let menu = await superMenu.find({});
        menu = menu.length
        let activeUsers = await users.find({},{
            username : 1 , profile_picture:1
        }).limit(5);
        return res.status(200).json({
            status:200,
            message : "success",
            data : {recentMenu,analytics,registeredBars,menu,activeUsers : activeUsers.length,userActivities:activeUsers}
        })
    }
    catch(error)
    {
        console.log(error.message)
        return res.status(500).json({
            status:500,
            message : error.message,
            data : {}
        })
    }
}
//

// app.js
// ... (other code)

// Route to fetch analytics data with filtering options

// ... (other code)


// ... (other code)

function getWeekOfMonth(date) {
    const startOfMonthDate = startOfMonth(date);
    const currentDate = date;
  
    let week = 0;
    let day = startOfMonthDate;
  
    while (day <= currentDate) {
      week++;
      day = addDays(day, 7);
    }
  
    return week;
  }

  const analytics = async (req, res) => {
    try {
      const { timeframe } = req.query;
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
        'September', 'October', 'November', 'December'
      ];
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
      let matchStage = {};
      let dateFormat = '';
      let startDate = null;
      let endDate = new Date(); // Default to today
  
      switch (timeframe) {
        case 'weekly':
          startDate = addDays(endDate, -6); // Last 7 days
          dateFormat = 'EEEE'; // Day of the week (e.g., Monday, Tuesday)
          break;
        case 'monthly':
          startDate = startOfMonth(endDate); // Start of the current month
          endDate = endOfMonth(endDate); // End of the current month
          dateFormat = 'w'; // Week number within the month
          break;
        case 'yearly':
          startDate = startOfMonth(new Date()); // Start of the current year
          endDate = endOfMonth(new Date()); // End of the current year
          dateFormat = 'MMMM'; // Month name
          break;
        default:
          // No filter, retrieve all data
          break;
      }
  
      matchStage = {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      };
  
      // Calculate the gained and lost sales for the selected timeframe
      const analytics = await order.aggregate([
        matchStage,
        {
          $group: {
            _id: {
              $dateToString: { format: dateFormat, date: '$createdAt' },
            },
            totalSales: { $sum: '$totalPrice' },
          },
        },
      ]);
  
      const response = {
        totalSales: [],
        timeframeData: [],
      };
  
      // Generate data for all days/weeks within the selected timeframe
      let currentDate = new Date(startDate);
      let weekCount = 1; // Initialize week count
      while (currentDate <= endDate) {
        const formattedDate = format(currentDate, dateFormat);
        const entry = analytics.find((entry) => entry._id === formattedDate);
  
        if (entry) {
          response.totalSales.push(entry.totalSales);
        } else {
          response.totalSales.push(0);
        }
  
        if (timeframe === 'weekly') {
          response.timeframeData.push(formattedDate);
        } else if (timeframe === 'monthly') {
          response.timeframeData.push(`Week ${weekCount}`);
          weekCount++; // Increment week count
        } else {
          response.timeframeData.push(formattedDate);
        }
  
        currentDate = addDays(currentDate, 1); // Move to the next day/week
      }
  
      res.json(response);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  

  
  
  
  
  
  
  // ... (other code)
  
  
  // ... (other code)
  


const inquiries = async (req, res) => {
    let Bar;
    try {

        let inquiries = await inquiry.aggregate([
            {
                $match: { "type": "barInquiry" }
            }
            , { $group: { _id: "$bar" } }])

        let data = inquiries

        data = await Promise.all(data.map(async (e) => {
            e = await bar.findOne({ _id: e._id }).select({ "barName": 1, "upload_document": 1 }).lean()
            e.inquiries = await inquiry.find({ bar: e._id })
            return e

        }))

        return res.status(200).json({
            status: 200,
            message: "success",
            data: data
        })
    }
    catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message,
            data
        })
    }
}

const updateInquiry = async (req, res) => {
    let { _id } = req.params;
    try {
        let data = await inquiry.findByIdAndUpdate({ _id }, { $set: req.body }, { new: true });
        return res.status(200).json({
            status: 200,
            message: "success",
            data
        })

    }
    catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message,
            data: {}
        })
    }
}

const getUserActivities = async (req, res) => {
    try {
        const { page, limit } = req.query;
        let [totalUsersCount, totalUsers] = await Promise.all([
            users.countDocuments({ status: { $ne: 2 } }),
            users.find({ status: { $ne: 2 } })
        ]);

        let [activeUsersCount, activeUsers] = await Promise.all([
            users.countDocuments({ status: 1 }),
            users.find({ status: 1 })
        ]);

        let [blockedUsersCount, blockedUsers] = await Promise.all([
            users.countDocuments({ status: 3 }),
            users.find({ status: 3 })
        ]);

        totalUsers = commonHelper.pagination(parseInt(page), parseInt(limit), totalUsers);
        activeUsers = commonHelper.pagination(parseInt(page), parseInt(limit), activeUsers);
        blockedUsers = commonHelper.pagination(parseInt(page), parseInt(limit), blockedUsers);

        const data = {
            'totalUsersCount': totalUsersCount, 'activeUsersCount': activeUsersCount, 'blockedUsersCount': blockedUsersCount,
            'totalUsers': totalUsers, 'activeUsers': activeUsers, 'blockedUsers': blockedUsers
        };

        return res.status(200).json({
            status: 200,
            message: "success",
            data: data
        });
    }
    catch (error) {
        return res.status(200).json({
            status: 500,
            message: error.message,
            data: {}
        });
    }
}

const blockOrUnBlockUser = async (req, res) => {
    if (req.body === undefined) {
        return res.status(200).json({
            status: 400,
            message: "Something went wrong",
            data: []
        });
    }
    const { id, status } = req.body;
    const updated = await users.findOneAndUpdate({ _id: id }, { $set: { status: status } });
    if (!updated) {
        return res.status(200).json({
            status: 404,
            message: "UserId is undefined!",
            data: []
        });
    } else {
        return res.status(200).json({
            status: 200,
            message: "Successfully updated",
            data: []
        });
    }
}

const barOwnersDetails = async (req, res) => {
    try {
        let bars = await bar.find({ status: { $ne: 2 } }).select('barName upload_logo state city active').lean().exec();
        bars = await Promise.all(bars.map(async (e) => {
            e.menus = await menu.find({ barId: e._id }).select('item category variation').lean().exec();

            e.menus = await Promise.all(e.menus.map(async (cat) => {
                cat.category = await menuCategory.find({ _id: cat.category }).select('name description category_image').lean().exec();
                return cat;
            }));

            e.menus = await Promise.all(e.menus.map(async (varr) => {
                varr.variation = await Promise.all(varr.variation.map(async (v) => {
                    [v.variant] = await pourtype.find({ _id: v.variant }).select('name description category_image').lean().exec();
                    return v;
                }));
                return varr;
            }));

            return e; // Return the modified 'e' object
        }));

        return res.status(200).json({
            status: 200,
            message: "success",
            data: bars
        });
    } catch (error) {
        return res.status(200).json({
            status: 500,
            message: error.message,
            data: []
        });
    }
}

export default {
    home,
    barOwnersDetails,
    inquiries,
    updateInquiry,
    getUserActivities,
    blockOrUnBlockUser,
    analytics
}