import OrderModel from "../../model/orderSchema.js";
import User from "../../model/userModel.js";
import ProductVariantModel from "../../model/productVarientModel.js";

async function getSalesData(startDate, endDate) {
  try {
    const salesData = await OrderModel.aggregate([
      // Stage 1: Filter results
      {
        $match: {
          orderDate: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      // Stage 2: Group data
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$orderDate" } }
          },
          totalSales: { $sum: "$totalAmount" },
          numOrders: { $sum: 1 }
        }
      }
    ]);

    // create a Map to store sales data and num of order by date
    const salesMap = new Map();

    let totalSales = 0;
    let totalNumOrders = 0;

    salesData.forEach((entry) => {
      const date = entry._id.date;
      const sales = entry.totalSales;
      const numOrders = entry.numOrders;

      salesMap.set(date, { sales, numOrders });
      totalSales += sales;
      totalNumOrders += numOrders;
    });

    // Generate an array of dates between start & end date
    const datesBetween = getDatesBetween(startDate, endDate);

    // create final sales data array with 0 for dates without sales
    const finalSalesData = datesBetween.map((date) => ({
      date,
      sales: (salesMap.get(date) || { sales: 0 }).sales,
      numOrders: (salesMap.get(date) || { numOrders: 0 }).numOrders
    }));

    return { salesData: finalSalesData, totalSales, totalNumOrders };
  } catch (err) {
    console.error(err);
    throw err;
  }
}

function getDatesBetween(startDate, endDate) {
  const dates = [];
  let currentDate = new Date(startDate);

  while (currentDate <= new Date(endDate)) {
    const formattedDate = currentDate.toISOString().split("T")[0];
    dates.push(formattedDate);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
}

// GET api/v1/admin/getSales
// --- admin
export const getSales = async (req, res) => {
  try {
    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);

    startDate.setUTCHours(0, 0, 0, 0);
    endDate.setUTCHours(23, 59, 59, 999);

    const { salesData, totalSales, totalNumOrders } = await getSalesData(startDate, endDate);

    const orders=await OrderModel.find()

  // Populate user and product details for each order
for (const entry of salesData) {

  const orders = await OrderModel.find({
    orderDate: {
      $gte: new Date(entry.date),
      $lte: new Date(entry.date + 'T23:59:59.999Z')
    }
  }).populate({
    path: 'userId',
    select: 'email name',
    model: User,
  }).populate({
    path: 'orderedItems.product',
    select: 'color images stock regularPrice isDeleted varientName salePrice specification offers',
    model: ProductVariantModel,
  });
  entry.orders = orders;
}

    res.status(200).json({ salesData, totalSales, totalNumOrders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Some Error occurred. Please try again!' });
  }
};
