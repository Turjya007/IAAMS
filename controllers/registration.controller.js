// controllers/registration.controller.js
const registrationModel = require('../models/registration.model');
const notificationModel = require('../models/notification.model');
const eventModel = require('../models/event.model');

// ============ Event এ Register করা ============
async function registerForEvent(req, res) {
  try {
    const { eventId, transactionId } = req.body;

    // 1st a check kora hocche event asole e ache ki na
    const event = await eventModel.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // notun registration creat kora hocche
    const newRegistration = await registrationModel.create({
      event: eventId,
      user: req.user.id, // je register koreche tar token thke paowa
      transactionId: transactionId
    });

    res.status(201).json({
      message: 'Registration successful. Waiting for admin to confirm payment.',
      registration: newRegistration
    });

  } catch (error) {

    // Ekhane special error check kora hocce: duplicate registration
    // Model e jei unique index diyechilam seta vangle MongoDB
    // error.code hisabe 11000 send kore
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'You have already registered for this event.'
      });
    }

    // অন্য যেকোনো error হলে সাধারণ 500 পাঠাচ্ছি
    res.status(500).json({
      message: 'Something went wrong',
      error: error.message
    });
  }
}

// ============ নিজের সব Registration দেখা ("My Events" এর জন্য) ============
async function getMyRegistrations(req, res) {
  try {
    const registrations = await registrationModel
      .find({ user: req.user.id })
      .populate('event') // pura event er info ana hocche (title, date, place etc)
      .sort({ createdAt: -1 });

    res.status(200).json(registrations);

  } catch (error) {
    res.status(500).json({
      message: 'Something went wrong',
      error: error.message
    });
  }
}

// ============ Payment "Paid" mark kora (only Admin) ============
async function markAsPaid(req, res) {
  try {
    // প্রথমে দেখি এখন পর্যন্ত কতগুলো registration "paid" আছে
    const paidCount = await registrationModel.countDocuments({ paymentStatus: 'paid' });

    // নতুন serial number বানাচ্ছি
    const nextNumber = paidCount + 1;
    const currentYear = new Date().getFullYear();

    // padStart(6, '0') মানে সংখ্যাটাকে 6 digit বানাচ্ছি, সামনে দরকার হলে 0 বসিয়ে
    // যেমন 1 হলে "000001", 25 হলে "000025"
    const serialNumber = 'AAMS-' + currentYear + '-' + String(nextNumber).padStart(6, '0');

    const updatedRegistration = await registrationModel.findByIdAndUpdate(
      req.params.id,
      {
        paymentStatus: 'paid',
        serialNumber: serialNumber
      },
      { new: true }
    ).populate('event', 'title');

        if (!updatedRegistration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // payment paid mark hoye gele, sei alumni ke notification pathacchi
    await notificationModel.create({
      user: updatedRegistration.user,
      message: `Your payment for "${updatedRegistration.event.title}" has been confirmed!`,
      type: 'payment_confirmed'
    });

    res.status(200).json({
      message: 'Payment marked as paid',
      registration: updatedRegistration
    });

  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
}

// ============ Pending Payment er list ana (only Admin) ============
async function getPendingPayments(req, res) {
  try {
    const pendingRegistrations = await registrationModel
      .find({ paymentStatus: 'pending' })
      .populate('event', 'title registrationFee') // event এর title এবং registrationFee আনছি
      .populate('user', 'name email') // শুধু user এর name, email আনছি
      .sort({ createdAt: -1 });

    res.status(200).json(pendingRegistrations);

  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
}

async function getInvitationCardData(req, res) {
  try {
    const registration = await registrationModel
      .findById(req.params.id)
      .populate('event', 'title eventDate place')
      .populate('user', 'name');

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // নিজের registration কিনা চেক করছি
    // registration.user._id ObjectId টাইপ, তাই .toString() করে string বানিয়ে তুলনা করছি
    if (registration.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not allowed to view this card' });
    }

    // যদি এখনো paid না হয়, তাহলে card দেখানোর কিছু নেই
    if (registration.paymentStatus !== 'paid') {
      return res.status(400).json({ message: 'Payment not confirmed yet' });
    }

    res.status(200).json(registration);

  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
}

async function markAttendance(req, res) {
  try {
    const eventId = req.params.eventId;
    const userId = req.user.id; // token theke asche, ke login kore ache

    // ei user ar ei event er registration ta khujchi
    const registration = await registrationModel.findOne({
      event: eventId,
      user: userId
    });

    if (!registration) {
      return res.status(404).json({ message: 'You have not registered for this event' });
    }

    // Payment paid na thakle attendance dewar dorkar nai
    if (registration.paymentStatus !== 'paid') {
      return res.status(400).json({ message: 'Your payment is not confirmed yet' });
    }

    // Already attended thakle abar mark korar dorkar nai
    if (registration.attended === true) {
      return res.status(200).json({ message: 'Attendance already marked', alreadyMarked: true });
    }

    registration.attended = true;
    await registration.save();

    res.status(200).json({ message: 'Attendance marked successfully', alreadyMarked: false });

  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
}

async function getAttendanceList(req, res) {
  try {
    const eventId = req.params.eventId;

    const attendedRegistrations = await registrationModel
      .find({ event: eventId, attended: true })
      .populate('user', 'name email')
      .sort({ updatedAt: -1 }); // sobar age jara sobcheye pore attend korlo tara dekhabe

    res.status(200).json(attendedRegistrations);

  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
}


module.exports = { registerForEvent, getMyRegistrations, markAsPaid, getPendingPayments,getInvitationCardData,markAttendance, getAttendanceList };