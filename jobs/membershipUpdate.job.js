// jobs/membershipUpdate.job.js
const userModel = require('../models/user.model');

async function updateMembershipTypes() {
  try {
    // ajker theke thik 1 bochor age ar 3 bochor ager date ber korchi
    const today = new Date();

    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    const threeYearsAgo = new Date(today);
    threeYearsAgo.setFullYear(today.getFullYear() - 3);

    // ============ Senior Member banano ============
    // jara 3 bochor ba tar age approve hoyeche, tader Senior banacchi
    const seniorResult = await userModel.updateMany(
      {
        status: 'approved',
        approvedAt: { $lte: threeYearsAgo },
        membershipType: { $ne: 'Senior Member' } // already Senior thakle abar update korar dorkar nai
      },
      { membershipType: 'Senior Member' }
    );

    // ============ Active Member banano ============
    // jara 1 bochor ba tar age approve hoyeche (kintu 3 bochor hoyni), tader Active banacchi
    const activeResult = await userModel.updateMany(
      {
        status: 'approved',
        approvedAt: { $lte: oneYearAgo, $gt: threeYearsAgo },
        membershipType: 'New Member' // shudhu New Member ra e upgrade hobe
      },
      { membershipType: 'Active Member' }
    );

    console.log('Membership update: ' + seniorResult.modifiedCount + ' jon Senior, ' + activeResult.modifiedCount + ' jon Active hoyeche');

  } catch (error) {
    console.log('Membership update e error hoyeche:', error.message);
  }
}

module.exports = updateMembershipTypes;