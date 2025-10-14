import { OrderStatus } from "../models/interface";

export const JWT_TOKEN_NAME = 'Authorization';

export const Messages = {
    Fetch_Error: "Error fetching users",
    Something_went_Wrong: "Something went wrong!",
    Internal_Server_Error: "Internal Server Error",
    Success: "Success",
    Fail: 'Fail',
    OrderCreated: 'Order Created successfully!',
    OrderCreating_Error: 'Order Processing failed!',
    OrderUpdated: 'Order Updated successfully!',
    Order_Total_Mismatch: "Total amount mismatch",
    Order_Not_Found: "Order not found",
    Invalid_Order_Status: "Invalid order status",
    Order_Status_Skipped: "Invalid status change. The order cannot move backward or skip steps.",
    Order_Cannot_Cancel: "Invalid status change. The order cannot cancel, it is alredy delivered.",
    Order_Cannot_Delivered: "Invalid status change. The order cannot devlivered, it is alredy canceled.",
    Order_Deleted: "Order Deleted successfully!",
    Order_Comments_Required: "Send Proper Comments, message and userId required",
    Order_Estimate_Date_Error: "Estimated delivery date should be greater than the current estimated delivery date.",

}





export const PaymentMethod = {
    Credit_Card: 'Credit Card',
    PayPal: 'PayPal',
    COD: 'COD'
}

export const PaymentStatus = {
    Pending: 'Pending',
    Paid: 'Paid',
    Failed: 'Failed'
}

export const orderAllowedUpdates = [
    'orderStatus',
    'deliveryAddress',
    'paymentInfo',
    'isActive',
    'deliveryAddress'
];


export const allowedOrderStatus = Object.values(OrderStatus);


export const validOrderSequence = [
    OrderStatus.Pending,    // Index 0
    OrderStatus.Confirmed, // Index 1
    OrderStatus.Preparing,  // Index 2
    OrderStatus.ReadyForPickup, // Index 3
    OrderStatus.OutForDelivery, // Index 4
    OrderStatus.Delivered,  // Index 5
    OrderStatus.Cancelled   // Index 6
];