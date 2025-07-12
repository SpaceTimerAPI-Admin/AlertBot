import fs from 'fs';
import fetch from 'node-fetch';

export async function checkAvailability(restaurantId, date, partySize) {
  const cookies = JSON.parse(fs.readFileSync('./session/cookies.json'));
  const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');

  const url = \`https://disneyworld.disney.go.com/dine-res/api/availability/\${partySize}/\${date}?entityId=\${restaurantId}\`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Cookie': cookieHeader,
      'User-Agent': 'Mozilla/5.0',
      'Accept': 'application/json',
      'Referer': 'https://disneyworld.disney.go.com/',
    }
  });

  if (!res.ok) {
    console.error('❌ Disney API error:', res.status);
    return false;
  }

  const data = await res.json();
  const available = data?.hours?.some(entry => entry.available);
  return available;
}
