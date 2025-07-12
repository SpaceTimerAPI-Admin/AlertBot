import fs from 'fs';
import fetch from 'node-fetch';

export async function checkAvailability(restaurant, date, partySize) {
  const cookies = JSON.parse(fs.readFileSync('./session/cookies.json'));
  const cookieHeader = cookies.map(c => \`\${c.name}=\${c.value}\`).join('; ');

  const response = await fetch(\`https://disneyworld.disney.go.com/api/dining-availability/\`, {
    headers: { Cookie: cookieHeader }
  });

  const data = await response.json();
  return data.times || [];
}