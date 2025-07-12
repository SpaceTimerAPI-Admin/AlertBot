
import fs from 'fs';
import fetch from 'node-fetch';

export async function checkAvailability(restaurant, date, time, partySize) {
  const cookies = JSON.parse(fs.readFileSync('./session/cookies.json'));
  const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');

  console.log(`🔍 Checking availability for ${restaurant} on ${date} at ${time} for party of ${partySize}`);

  // Replace this URL and logic with the actual Disney dining search endpoint
  const searchUrl = `https://disneyworld.disney.go.com/api/dining/availability/${restaurant}?date=${date}&time=${time}&partySize=${partySize}`;

  try {
    const response = await fetch(searchUrl, {
      headers: {
        'Cookie': cookieHeader,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`Failed to fetch availability: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data?.availability?.map(slot => `${slot.time} - ${slot.url}`) || [];

  } catch (error) {
    console.error('❌ Error checking availability:', error);
    return [];
  }
}
