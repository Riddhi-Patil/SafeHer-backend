import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Save location
router.post('/updateLocation', async (req, res) => {
  console.log("BODY RECEIVED (updateLocation):", req.body);
  const { userId, latitude, longitude } = req.body;

  try {
    await User.findByIdAndUpdate(userId, { 
      latitude, 
      longitude,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude] // [longitude, latitude] for GeoJSON
      }
    });
    console.log(`Location updated for user ${userId}: [${latitude}, ${longitude}]`);
    res.json({ success: true });
  } catch (err) {
    console.error("Error updating location:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Save push token
router.post('/savePushToken', async (req, res) => {
  console.log("BODY RECEIVED (savePushToken):", req.body);
  const { userId, token, pushToken, communitySOS } = req.body;
  const finalToken = token || pushToken;

  if (!userId || !finalToken) {
    return res.status(400).json({ error: "Missing userId or token" });
  }

  try {
    // Update both pushToken and communitySOS status
    const updatedUser = await User.findByIdAndUpdate(userId, { 
      pushToken: finalToken,
      communitySOS: communitySOS === true // Save the toggle status
    }, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    console.log(`Push token & SOS status saved for user ${updatedUser.name}`);
    res.json({ success: true, name: updatedUser.name });
  } catch (err) {
    console.error("Error saving push token:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/debug/enableAll', async (req, res) => {
  try {
    const result = await User.updateMany({}, { communitySOS: true });
    res.json({ 
      success: true, 
      message: `Force enabled Community SOS for ${result.modifiedCount} users`,
      details: result
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

