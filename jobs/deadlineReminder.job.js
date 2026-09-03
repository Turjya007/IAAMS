// jobs/deadlineReminder.job.js
const eventModel = require('../models/event.model');
const userModel = require('../models/user.model');
const notificationModel = require('../models/notification.model');

async function sendDeadlineReminders() {
  try {
    // ajker date theke thik 2 din porer date ber korchi
    const today = new Date();
    const twoDaysLater = new Date(today);
    twoDaysLater.setDate(today.getDate() + 2);

    // shudhu date (year-month-day) match korbo, time bad diye
    // tai shuru (00:00:00) ar shesh (23:59:59) - eirokom ekta range banacchi
    const startOfDay = new Date(twoDaysLater.getFullYear(), twoDaysLater.getMonth(), twoDaysLater.getDate(), 0, 0, 0);
    const endOfDay = new Date(twoDaysLater.getFullYear(), twoDaysLater.getMonth(), twoDaysLater.getDate(), 23, 59, 59);

    // egulo hocche shei shob event jader deadline thik 2 din pore
    const events = await eventModel.find({
      status: 'approved',
      registrationDeadline: { $gte: startOfDay, $lte: endOfDay }
    });

    if (events.length === 0) {
      console.log('Deadline reminder: aj kono event er deadline 2 din pore nai');
      return;
    }

    // shob user (alumni + admin) ana hocche
    const allUsers = await userModel.find({});

    // protita event er jonno, protita user ke ekta kore notification pathacchi
    for (let i = 0; i < events.length; i++) {
      const event = events[i];

      for (let j = 0; j < allUsers.length; j++) {
        const user = allUsers[j];

        await notificationModel.create({
          user: user._id,
          message: `Reminder: Registration deadline for "${event.title}" is in 2 days!`,
          type: 'deadline_reminder'
        });
      }
    }

    console.log('Deadline reminder: notification pathano hoye geche');

  } catch (error) {
    console.log('Deadline reminder e error hoyeche:', error.message);
  }
}

module.exports = sendDeadlineReminders;