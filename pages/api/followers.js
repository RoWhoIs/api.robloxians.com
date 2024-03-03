/*
    Used for fetching followers for the creator of RoWhoIs to provide them with an easter egg on their whois profile.
    Developed by RoWhoIs

    CONTRIBUTORS:
    https://github.com/aut-mn
 */
import axios from 'axios';

let requestTimestamps = [];

function isRateLimited() {
    const currentTime = Date.now();
    requestTimestamps = requestTimestamps.filter(timestamp => currentTime - timestamp < 60000);
    if (requestTimestamps.length >= 2) {
        return true;
    } else {
        requestTimestamps.push(currentTime);
        return false;
    }
}

export default async function handler(req, res) {
    if (isRateLimited()) { // ALWAYS check for rate limiting first!
        res.status(429).json({ error: 'Too Many Requests' });
        return;
    }
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        res.status(405).json({error: 'Invalid Method'});
        return;
    }
    const baseUrl = 'https://friends.roblox.com/v1/users/5192280939/followers';
    let followersIds = [];
    let count  = 0;
    let nextPageCursor = '';
    try {
        do {
            const url = `${baseUrl}?limit=100&sortOrder=Asc${nextPageCursor ? `&cursor=${nextPageCursor}` : ''}`;
            const response = await axios.get(url);
            const data = response.data;
            followersIds = followersIds.concat(data.data.map(follower => follower.id));
            nextPageCursor = data.nextPageCursor;
        } while (nextPageCursor !== null);
        const response = await axios.get('https://friends.roblox.com/v1/users/5192280939/followers/count');
        count = response.data.count;
        res.status(200).json({ count, followersIds });
    } catch (error) {
        console.error('Failed to fetch followers:', error);
        res.status(500).json({ error: 'Failed to fetch followers' });
    }
}
