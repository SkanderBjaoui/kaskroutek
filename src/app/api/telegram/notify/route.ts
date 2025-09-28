import { NextRequest, NextResponse } from 'next/server';
import { sendOrderNotification, OrderNotification } from '@/lib/telegram';

export async function POST(request: NextRequest) {
  try {
    const orderData: OrderNotification = await request.json();
    
    const success = await sendOrderNotification(orderData);
    
    if (success) {
      return NextResponse.json({ success: true, message: 'Telegram notification sent successfully' });
    } else {
      return NextResponse.json({ success: false, message: 'Failed to send Telegram notification' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in Telegram notification API:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
