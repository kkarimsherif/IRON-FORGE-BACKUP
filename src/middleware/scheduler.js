const cron = require('node-cron');
const { sendClassReminders } = require('../api/classes.controller');
const Notification = require('../models/notification.model');
const User = require('../models/user.model');
const { sendNotification } = require('../api/notifications.controller');

/**
 * Initialize all scheduled tasks for the application
 */
exports.initScheduler = () => {
  console.log('Starting application schedulers...');
  
  // Send class reminders daily at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('Running scheduled task: Daily class reminders');
    try {
      const result = await sendClassReminders();
      console.log(`Class reminder results: ${result.message}`);
    } catch (err) {
      console.error('Error sending class reminders:', err);
    }
  });
  
  // Clean up old read notifications (older than 30 days) weekly on Sunday at 2:00 AM
  cron.schedule('0 2 * * 0', async () => {
    console.log('Running scheduled task: Weekly notification cleanup');
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const result = await Notification.deleteMany({
        read: true,
        createdAt: { $lt: thirtyDaysAgo }
      });
      
      console.log(`Cleaned up ${result.deletedCount} old notifications`);
    } catch (err) {
      console.error('Error cleaning up notifications:', err);
    }
  });
  
  // Send membership expiration reminders daily at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('Running scheduled task: Membership expiration reminders');
    try {
      // Get users whose membership expires in 7 days
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      const startOfDay = new Date(sevenDaysFromNow.setHours(0, 0, 0, 0));
      const endOfDay = new Date(sevenDaysFromNow.setHours(23, 59, 59, 999));
      
      const expiringUsers = await User.find({
        membershipType: { $ne: 'none' },
        membershipExpires: { $gte: startOfDay, $lte: endOfDay }
      });
      
      // Send notification to each user
      for (const user of expiringUsers) {
        await sendNotification({
          title: 'Membership Expiring Soon',
          message: `Your ${user.membershipType} membership is set to expire in 7 days on ${user.membershipExpires.toLocaleDateString()}. Renew now to maintain your benefits!`,
          type: 'membership',
          user: user._id,
          priority: 'high',
          action: {
            url: '/membership/renew',
            text: 'Renew Membership'
          }
        });
      }
      
      console.log(`Sent membership expiration reminders to ${expiringUsers.length} users`);
    } catch (err) {
      console.error('Error sending membership expiration reminders:', err);
    }
  });

  // Notify users of upcoming orders (shipping/delivery) at 10:00 AM daily
  cron.schedule('0 10 * * *', async () => {
    console.log('Running scheduled task: Order delivery updates');
    try {
      const Order = require('../models/order.model');
      
      // Get orders expected to be delivered today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const deliveringOrders = await Order.find({
        status: 'shipped',
        expectedDeliveryDate: { $gte: today, $lt: tomorrow }
      });
      
      // Send notification to each user
      for (const order of deliveringOrders) {
        await sendNotification({
          title: 'Your Order is Arriving Today',
          message: `Good news! Your order #${order._id.toString().slice(-6)} is scheduled for delivery today.`,
          type: 'order',
          user: order.user,
          priority: 'normal',
          reference: {
            model: 'Order',
            id: order._id
          }
        });
      }
      
      console.log(`Sent delivery notifications for ${deliveringOrders.length} orders`);
    } catch (err) {
      console.error('Error sending order delivery notifications:', err);
    }
  });
  
  console.log('All schedulers initialized successfully');
};

/**
 * Setup a one-time job to run after a delay
 * @param {Function} job The function to execute
 * @param {number} delayMs Delay in milliseconds
 */
exports.scheduleOneTimeJob = (job, delayMs) => {
  return setTimeout(job, delayMs);
};

/**
 * Cancel a scheduled one-time job
 * @param {number} jobId The timeout ID returned by scheduleOneTimeJob
 */
exports.cancelOneTimeJob = (jobId) => {
  clearTimeout(jobId);
}; 