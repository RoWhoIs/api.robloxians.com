/*
    Used for fetching followers for the creator of RoWhoIs to provide users who follow her with an easter egg on their whois profile.
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
        res.status(405).json({ error: 'Invalid Method' });
        return;
    }
    let followerIds = [];
    let count = 0;
    let nextPageCursor = '';

    try {
        const [countResponse, firstPageResponse] = await Promise.all([axios.get('https://friends.roblox.com/v1/users/5192280939/followers/count'), axios.get(`https://friends.roblox.com/v1/users/5192280939/followers?limit=100&sortOrder=Asc`)]);
        count = countResponse.data.count;
        followerIds = followerIds.concat(firstPageResponse.data.data.map(follower => follower.id));
        nextPageCursor = firstPageResponse.data.nextPageCursor;
        while (nextPageCursor) {
            const response = await axios.get('https://friends.roblox.com/v1/users/5192280939/followers?limit=100&sortOrder=Asc&cursor=' + nextPageCursor );
            followerIds = followerIds.concat(response.data.data.map(follower => follower.id));
            nextPageCursor = response.data.nextPageCursor;
        }
        res.status(200).json({ count, followerIds });
    } catch (error) {
        console.error('Failed to fetch followers:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
