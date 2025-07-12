import fs from 'fs';

export async function checkAvailability(restaurant, date, partySize) {
  const cookies = JSON.parse(fs.readFileSync('./session/cookies.json'));
  // Simulate API check – to be replaced with real Disney API call
  return Math.random() < 0.3; // simulate 30% chance of availability
}
