/*
    Used for determining if the API endpoint is okay. Use this as a benchmark, if it doesn't return 200, there's a problem with the API.
    Developed by RoWhoIs

    CONTRIBUTORS:
    https://github.com/aut-mn
 */
let requestTimestamps = [];
function isRateLimited() {
  const currentTime = Date.now();
  requestTimestamps = requestTimestamps.filter(timestamp => currentTime - timestamp < 60000);
  if (requestTimestamps.length >= 4) {
    return true;
  } else {
    requestTimestamps.push(currentTime);
    return false;
  }
}

export default function handler(req, res) {
  if (isRateLimited()) {
    res.status(429).json({ error: 'Too Many Requests' });
    return;
  }
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: 'Invalid Method' });
    return;
  }
  res.status(200).json({ status: 'API is OK.' });
}
