import fetch from 'node-fetch';

const sendPush = async (token, lat, lon) => {
  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: token,
        sound: 'default',
        title: '🚨 SafeHer Alert',
        body: 'Someone nearby needs help!',
        data: { latitude: lat, longitude: lon },
      }),
    });
  } catch (err) {
    console.error('Push error:', err);
  }
};

export default sendPush;

