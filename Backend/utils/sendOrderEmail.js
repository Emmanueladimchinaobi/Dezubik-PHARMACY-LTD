const dotenv = require("dotenv");
dotenv.config();

const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOrderEmail = async (order) => {
    try {

        const itemsText = order.items.map(item => `
${item.name}
Size: ${item.size || "N/A"}
Colour: ${item.colour || "N/A"}
Quantity: ${item.quantity}
Price: ₦${item.price.toLocaleString()}
        `).join("\n");

        const result = await resend.emails.send({

            from: "onboarding@resend.dev",

            to: process.env.OWNER_EMAIL,

            subject: `New Luxelingeriebyella Order - ${order.customerName}`,

            text: `
NEW ORDER - LUXELINGERIEBYELLA

Customer:
${order.customerName}

Phone:
${order.phone}

Address:
${order.address}

State:
${order.state}

Payment Method:
${order.paymentMethod}

Items:
${itemsText}

Total:
₦${order.total.toLocaleString()}

Order Status:
${order.status}
            `
        });

        console.log("ORDER EMAIL SENT:", result);

    } catch (error) {

        console.error("RESEND ERROR:", error);

    }
};

module.exports = sendOrderEmail;
