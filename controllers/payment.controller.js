// controllers/payment.controller.js
const SSLCommerzPayment = require('sslcommerz-lts');
const registrationModel = require('../models/registration.model');
const eventModel = require('../models/event.model');
const { generateSerialNumber } = require('../controllers/registration.controller'); 
const fundModel = require('../models/fund.model');



const store_id = process.env.SSLCZ_STORE_ID;
const store_passwd = process.env.SSLCZ_STORE_PASSWORD;
const is_live = false; // sandbox mode, tai always false rakhchi ekhon

// Step 1: Payment shuru kora (Alumni "Pay Now" button e click korle ei function call hobe)
async function initiatePayment(req, res) {
  try {
    const registrationId = req.params.registrationId;

    // Registration ta khuje ber kora, event ar user er info soho
    const registration = await registrationModel
      .findById(registrationId)
      .populate('event')
      .populate('user');

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    if (registration.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'This registration is already paid' });
    }

    // Notun ekta unique transaction ID nije theke generate kortesi
    // (age user hater lekha transaction ID dito, ekhon system nije banabe)
    const tran_id = 'AAMS_' + registration._id + '_' + Date.now();

    // Registration er vitore ei notun tran_id ta save kore rakhtesi
    // jate pore success/IPN e ei tran_id diye registration ta khuje ber kora jai
    registration.transactionId = tran_id;
    await registration.save();

    // SSLCommerz ke ja ja info dite hoy (onek field, kintu shobgulai eder rule onujayi lagbe)
    const data = {
      total_amount: registration.event.registrationFee,
      currency: 'BDT',
      tran_id: tran_id,
      success_url: process.env.APP_BASE_URL + '/api/payment/success',
      fail_url: process.env.APP_BASE_URL + '/api/payment/fail',
      cancel_url: process.env.APP_BASE_URL + '/api/payment/cancel',
      ipn_url: process.env.APP_BASE_URL + '/api/payment/ipn',
      shipping_method: 'NO', // amader kono product ship korte hoy na, tai 'NO'
      product_name: registration.event.title,
      product_category: 'Event Registration',
      product_profile: 'general',
      cus_name: registration.user.name,
      cus_email: registration.user.email,
      cus_add1: 'Dhaka',
      cus_city: 'Dhaka',
      cus_postcode: '1000',
      cus_country: 'Bangladesh',
      cus_phone: '01700000000', // Alumni er number na thakle placeholder
      ship_name: registration.user.name,
      ship_add1: 'Dhaka',
      ship_city: 'Dhaka',
      ship_postcode: 1000,
      ship_country: 'Bangladesh'
    };

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const apiResponse = await sslcz.init(data);

    // apiResponse er vitore GatewayPageURL thake, ei URL e user ke pathate hobe
    res.status(200).json({ url: apiResponse.GatewayPageURL });

  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
}

// Step 2: Payment SUCCESS hole SSLCommerz ei route e user ke pathabe
async function paymentSuccess(req, res) {
  try {
    const tran_id = req.body.tran_id;
    const val_id = req.body.val_id;

    const registration = await registrationModel.findOne({ transactionId: tran_id }).populate('event');

    if (!registration) {
      return res.redirect(process.env.APP_BASE_URL + '/dashboard.html?payment=notfound');
    }

    // Age theke paid na thakle, ekhon paid kore dicchi
    if (registration.paymentStatus !== 'paid') {
       registration.paymentStatus = 'paid';
      registration.serialNumber = await generateSerialNumber();
      await registration.save();

      // Payment successful hoyeche, tai Fund e automatically ekta income entry jog kortesi
      await fundModel.create({
        type: 'income',
        category: 'Event Registration',
        amount: registration.event.registrationFee,
        description: 'Auto: Payment for "' + registration.event.title + '" (Transaction ID: ' + tran_id + ')',
        event: registration.event._id,
        addedBy: registration.event.approvedBy
      });
    }

    res.redirect(process.env.APP_BASE_URL + '/dashboard.html?payment=success');

  } catch (error) {
    res.redirect(process.env.APP_BASE_URL + '/dashboard.html?payment=error');
  }
}

// Step 3: Payment FAIL hole
function paymentFail(req, res) {
  res.redirect(process.env.APP_BASE_URL + '/dashboard.html?payment=failed');
}

// Step 4: Payment CANCEL hole (user nije cancel korle)
function paymentCancel(req, res) {
  res.redirect(process.env.APP_BASE_URL + '/dashboard.html?payment=cancelled');
}

// Step 5: IPN — SSLCommerz er server nije theke ei route e call kore (eitai shobcheye important o reliable)
async function paymentIPN(req, res) {
  try {
    const tran_id = req.body.tran_id;
    const val_id = req.body.val_id;

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const validation = await sslcz.validate({ val_id: val_id });

    // validation.status 'VALID' or 'VALIDATED' hole tobei ashol payment
    if (validation.status === 'VALID' || validation.status === 'VALIDATED') {
          const registration = await registrationModel.findOne({ transactionId: tran_id }).populate('event');

      if (registration && registration.paymentStatus !== 'paid') {
        registration.paymentStatus = 'paid';
        registration.serialNumber = await generateSerialNumber();
        await registration.save();

        await fundModel.create({
          type: 'income',
          category: 'Event Registration',
          amount: registration.event.registrationFee,
          description: 'Auto: Payment for "' + registration.event.title + '" (Transaction ID: ' + tran_id + ')',
          event: registration.event._id,
          addedBy: registration.event.approvedBy
        });
      }
    }

    res.status(200).send('IPN received');

  } catch (error) {
    res.status(500).send('IPN error');
  }
}

module.exports = { initiatePayment, paymentSuccess, paymentFail, paymentCancel, paymentIPN };