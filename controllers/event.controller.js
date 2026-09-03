// controllers/event.controller.js
const eventModel = require('../models/event.model');
const notificationModel = require('../models/notification.model');

// Event creat kora (ekhon Admin ar Alumni duijon e parbe) 
async function createEvent(req, res) {
  try {
    const { title, description, place, eventDate, registrationDeadline, registrationFee, bkashNumber } = req.body;

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

// ============ Pending Event গুলোর লিস্ট (শুধু Admin দেখবে, review করার জন্য) ============
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

// ============ Event Approve করা (শুধু Admin) ============
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

// ============ Event Reject করা (শুধু Admin) ============
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

module.exports = { createEvent, getAllEvents, getPendingEvents, approveEvent, rejectEvent };