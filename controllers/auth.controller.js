// controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');

// Register korar Logic
async function registerUser(req, res) {
  try {
    const { name, email, password, role, batch, department, graduationYear } = req.body;

    // Step 1: check kora hobe ei same email diye already account ache ki na
    const existingUser = await userModel.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({
        message: 'This email is already registered'
      });
    }

    // Step 2: Password ke hash (encrypt) kora hobe
    const hashedPassword = await bcrypt.hash(password, 10);
    // 10 holo "salt rounds" — joto beshi, toto beshi secure but slow। Tai 10 dilam, beshi slow ow na abar motamuti secure o।

    // Step 3: new user banano (hashed password use kore)
    const newUser = await userModel.create({
      name: name,
      email: email,
      password: hashedPassword,
      role: role,
      batch: batch,
      department: department,
      graduationYear: graduationYear
    });

    // Step 4: Response send kora hocce (but password response a pathano hobe na, security er joone)
    res.status(201).json({
      message: 'Registration successful. Waiting for admin approval.',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    res.status(500).json({
      message: 'Something went wrong',
      error: error.message
    });
  }
}


// Login Logic down below
async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    // Step 1: ei email dia user ache kina khuje
    const user = await userModel.findOne({ email: email });
    if (!user) {
      return res.status(404).json({
        message: 'No account found with this email'
      });
    }

    // Step 2: Password milche ki na check kore
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: 'Incorrect password'
      });
    }

    // Step 3: Alumni hole status "approved" kina check kore (Adminer jonno checking dorkar nai)
    if (user.role === 'alumni' && user.status !== 'approved') {
      return res.status(403).json({
        message: `Your account is currently ${user.status}. Please contact with the Department of CSE at IUBAT 4th flor.`
      });
    }

    // Step 4: JWT Token creat kore
    const token = jwt.sign(
      { id: user._id, role: user.role }, // token er vitore ei info thakbe
      process.env.JWT_SECRET,             // .env theke neowa secret key
      { expiresIn: '7d' }                 // token 7 din valid thakbe, er por expire hobe
    );

    // Step 5: Response send kore
    res.status(200).json({
      message: 'Login successful',
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });

  } catch (error) {
    res.status(500).json({
      message: 'Something went wrong',
      error: error.message
    });
  }
}

// ei function ta login kora user er nijer profile er info ferot pathai. Jar karone login korar por profile a sob dorkari info gula dekha jai
const getMe = async (req, res) => {
  try {
    // verifyToken middleware agei req.user = { id, role } boshiye diyeche
    // .select('-password') diye password field ta bad diye baki sob info ana hocche
    const user = await userModel.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);

  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

module.exports = { registerUser, loginUser, getMe };