import cron from 'node-cron';
import { User } from './user.model';

// Schedule a job to run every day at midnight
cron.schedule('0 0 * * *', async () => {
  try {
    const now = new Date();

    // Find all users where premium has expired
    const expiredUsers = await User.find({
      isPremium: true,
      premiumExpiryDate: { $lte: now },
    });

    // Expire premium status for each user
    for (const user of expiredUsers) {
      user.isPremium = false;
      user.premiumExpiryDate = undefined; // Clear the expiry date
      await user.save();
      console.log(`Expired premium for user: ${user.name}`);
    }
  } catch (error) {
    console.error('Error expiring premium users:', error);
  }
});
