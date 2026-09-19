// controllers/event.controller.js
const eventModel = require('../models/event.model');
const notificationModel = require('../models/notification.model');
const registrationModel = require('../models/registration.model'); 
const userModel = require('../models/user.model');

// Event creat kora (ekhon Admin ar Alumni duijon e parbe) 
async function createEvent(req, res) {
  try {
    const { title, description, place, eventDate, registrationDeadline, registrationFee, bkashNumber } = req.body;

    // bKash number thik format e ache kina check kortesi by using regular expression (regex)
    // Bangladeshi mobile number: 01 diye shuru, tarpor 9 ta digit (mot 11 digit), shudhu number
    const bkashNumberPattern = /^01[0-9]{9}$/;

    if (!bkashNumberPattern.test(bkashNumber)) {
      return res.status(400).json({
        message: 'bKash number must be exactly 11 digits and start with 01 (e.g., 01712345678)'
      });
    }


    // Admin/Alumni jei hok, sobar post "pending" diye shuru hobe
    const newEvent = await eventModel.create({
      title: title,
      description: description,
      place: place,
      eventDate: eventDate,
      registrationDeadline: registrationDeadline,
      registrationFee: registrationFee,
      bkashNumber: bkashNumber,
      postedBy: req.user.id,
      status: 'pending',
      approvedBy: null
    });

    res.status(201).json({
      message: 'Event submitted. Waiting for admin approval.',
      event: newEvent
    });

  } catch (error) {
    res.status(500).json({
      message: 'Something went wrong',
      error: error.message
    });
  }
}
// ============ sob Approved Event er list (Feed er jonno) ============
async function getAllEvents(req, res) {
  try {
    const events = await eventModel
      .find({ status: 'approved' })
      .populate('postedBy', 'name')      //  only 'name' field ta niye ashchi, puro user object na
      .populate('approvedBy', 'name')    //  etao same kaj kore
      .sort({ createdAt: -1 });

    res.status(200).json(events);

  } catch (error) {
    res.status(500).json({
      message: 'Something went wrong',
      error: error.message
    });
  }
}

// ============ Pending Event gular list (shudhu Admin dekhbe, review korar jonno) ============
async function getPendingEvents(req, res) {
  try {
    const events = await eventModel
  .find({ status: 'pending' })
  .populate('postedBy', 'name')
  .sort({ createdAt: -1 });

  res.status(200).json(events);

  } catch (error) {
    res.status(500).json({
      message: 'Something went wrong',
      error: error.message
    });
  }
}

// ============ Event Approve kora (shudhu Admin) ============
async function approveEvent(req, res) {
  try {
    const updatedEvent = await eventModel.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', approvedBy: req.user.id },
      { new: true }
    );

        if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // event approve hoye gele, je alumni post koreche take notification pathacchi
    await notificationModel.create({
      user: updatedEvent.postedBy,
      message: `Your event "${updatedEvent.title}" has been approved!`,
      type: 'event_approved'
    });

    res.status(200).json({ message: 'Event approved', event: updatedEvent });

  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
}

// ============ Event Reject kora (shudhu Admin) ============
async function rejectEvent(req, res) {
  try {
    const updatedEvent = await eventModel.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json({ message: 'Event rejected', event: updatedEvent });

  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
}

// ============ Event Delete kora (shudhu Admin) ============
async function deleteEvent(req, res) {
  try {
    const eventId = req.params.id;

    const event = await eventModel.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // ei event er shob registration khujchi, notification pathanor age
    const registrations = await registrationModel.find({ event: eventId });

    // protita affected alumni ke ekta notification pathacchi
    for (let i = 0; i < registrations.length; i++) {
      await notificationModel.create({
        user: registrations[i].user,
        message: `The event "${event.title}" has been cancelled. If you have already paid, please contact the Department of CSE at IUBAT for a refund.`,
        type: 'event_cancelled'
      });
    }

    // ekhon shob registration delete kortesi
    await registrationModel.deleteMany({ event: eventId });

    // event ta jei postCoreche, se jodi Alumni hoy tahole take o notification pathacchi
    // (Admin nijei post kore thakle notification pathanor dorkar nai)
    const eventPoster = await userModel.findById(event.postedBy);

    if (eventPoster && eventPoster.role === 'alumni') {
      await notificationModel.create({
        user: event.postedBy,
        message: `Your event "${event.title}" has been deleted by admin.`,
        type: 'event_cancelled'
      });
    }

    // shobsheshe event ta nijei delete kortesi
    await eventModel.findByIdAndDelete(eventId);

    res.status(200).json({ message: 'Event and its registrations deleted, alumni notified' });

  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
}

module.exports = { createEvent, getAllEvents, getPendingEvents, approveEvent, rejectEvent, deleteEvent };