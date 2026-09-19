// controllers/registration.controller.js
const registrationModel = require('../models/registration.model');
const notificationModel = require('../models/notification.model');
const eventModel = require('../models/event.model');


// Serial number banano — eita  2 jaigai lagbe (markAsPaid ar payment.controller),
// tai alada function baniye export kore dicchi
async function generateSerialNumber() {
  const paidCount = await registrationModel.countDocuments({ paymentStatus: 'paid' });
  const nextNumber = paidCount + 1;
  const currentYear = new Date().getFullYear();
  return 'AAMS-' + currentYear + '-' + String(nextNumber).padStart(6, '0');
}

// ============ Event এ Register kora ============
async function registerForEvent(req, res) {
  try {
    const { eventId } = req.body;   
    const event = await eventModel.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const newRegistration = await registrationModel.create({
      event: eventId,
      user: req.user.id
      // ⬅️ transactionId: transactionId — ei line-tao ekhane bad deya hoyeche
    });

    res.status(201).json({
      message: 'Registration successful. Proceed to payment.',   // ⬅️ message change kora hoyeche
      registration: newRegistration
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already registered for this event.' });
    }
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
}


// ============ nijer sob Registration dekha ("My Events" er jonno) ============
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

    const serialNumber = await generateSerialNumber();

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
      .populate('event', 'title registrationFee') // event er title ebong registrationFee anchi
      .populate('user', 'name email') // sudhu user er name, email anchi
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

    // Nijer registration kina check korchi
    // registration.user._id ObjectId tyype, tai .toString() kore string baniye compare korchi
    if (registration.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not allowed to view this card' });
    }

    // jodi ekhono paid na hoi, tahole card dekhanor kichu nei
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


module.exports = { registerForEvent, getMyRegistrations, markAsPaid, getPendingPayments, getInvitationCardData, markAttendance, getAttendanceList, generateSerialNumber };