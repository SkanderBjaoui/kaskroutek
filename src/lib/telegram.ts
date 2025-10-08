const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

export interface OrderNotification {
  username: string;
  phoneNumber: string;
  sandwich: string;
  price: number;
  time: string;
  paymentMethod: 'cash' | 'points';
  note?: string;
  deliveryMethod?: 'pickup' | 'shipping';
  pickupTime?: string; // ISO
  shippingTime?: string; // ISO
}

export async function sendOrderNotification(order: OrderNotification): Promise<boolean> {
  try {
    const pickupTimeDisplay = order.pickupTime ? new Date(order.pickupTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : '-';
    const shippingTimeDisplay = order.shippingTime ? new Date(order.shippingTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : '-';
    const message = `🍞 New Order Alert! 🍞

👤 User: ${order.username}
📱 Phone: ${order.phoneNumber}
🥪 Sandwich: ${order.sandwich}
💰 Price: ${order.price.toFixed(2)} TND
💳 Payment: ${order.paymentMethod === 'points' ? '💎 Points' : '💵 Cash'}
⏰ Time: ${order.time}
📝 Note: ${order.note ? order.note : '-'}
🚚 Delivery: ${order.deliveryMethod || 'pickup'}
🕒 ${order.deliveryMethod === 'shipping' ? 'Shipping time' : 'Pickup time'}: ${order.deliveryMethod === 'shipping' ? shippingTimeDisplay : pickupTimeDisplay}

Order placed successfully! 🎉`;

    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });

    if (!response.ok) {
      console.error('Telegram API error:', await response.text());
      return false;
    }

    const result = await response.json();
    return result.ok;
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    return false;
  }
}

