// controllers/admin.controller.js
const userModel = require('../models/user.model');

// Alumni ke Approve korar Logic
async function approveUser(req, res) {
  try {
    const userId = req.params.id;

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { status: 'approved' ,approvedAt: new Date()},
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.status(200).json({
      message: 'User approved successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        status: updatedUser.status
      }
    });

  } catch (error) {
    res.status(500).json({
      message: 'Something went wrong',
      error: error.message
    });
  }
}

// Alumni ke Reject korar Logic
async function rejectUser(req, res) {
  try {
    const userId = req.params.id;

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { status: 'rejected' },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.status(200).json({
      message: 'User rejected',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        status: updatedUser.status
      }
    });

  } catch (error) {
    res.status(500).json({
      message: 'Something went wrong',
      error: error.message
    });
  }
}

// ============ Pending Alumni দের লিস্ট আনা ============
async function getPendingUsers(req, res) {
  try {
    // only "pending" status and role "alumni" emon user khoja hocche
    // (admin nijeo pending thakte pare jodi manually approve kora na hoye thake,
    // kintu apatoto only alumni der approve korar jonno eta banacchi)
    const pendingUsers = await userModel
      .find({ status: 'pending', role: 'alumni' })
      .select('-password'); // password ke exclude kore baki sob info return kore

    res.status(200).json(pendingUsers);

  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
}

module.exports = { approveUser, rejectUser, getPendingUsers };