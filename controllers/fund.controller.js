// controllers/fund.controller.js
const fundModel = require('../models/fund.model');

// ============ নতুন Income/Expense Entry যোগ করা ============
async function addFundEntry(req, res) {
  try {
    const { type, category, amount, description, event } = req.body;

    if (!type || !category || !amount) {
      return res.status(400).json({ message: 'Type, category and amount are required' });
    }

    // amount ta positive number kina check kortesi (negative/zero hole reject kortesi)
    if (Number(amount) <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }

    const newEntry = await fundModel.create({
      type: type,
      category: category,
      amount: amount,
      description: description,
      event: event || undefined,
      // event na thakle undefined pathacchi, jate MongoDB khali string ("") save na kore
      addedBy: req.user.id
    });

    res.status(201).json({ message: 'Fund entry added successfully', entry: newEntry });

  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
}

// ============ সব Entry + Summary (total income, expense, balance) আনা ============
async function getFundData(req, res) {
  try {
    const allEntries = await fundModel
      .find()
      .populate('addedBy', 'name')
       .populate('event', 'title')
      .sort({ createdAt: -1 }); // notun entry uporey dekhabe

    // ei duita variable e amra jog kore kore total ber korbo
    let totalIncome = 0;
    let totalExpense = 0;

    for (let i = 0; i < allEntries.length; i++) {
      if (allEntries[i].type === 'income') {
        totalIncome = totalIncome + allEntries[i].amount;
      } else {
        totalExpense = totalExpense + allEntries[i].amount;
      }
    }

    const balance = totalIncome - totalExpense;

    res.status(200).json({
      entries: allEntries,
      totalIncome: totalIncome,
      totalExpense: totalExpense,
      balance: balance
    });

  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
}

module.exports = {
  addFundEntry,
  getFundData
};