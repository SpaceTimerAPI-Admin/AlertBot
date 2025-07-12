
import fs from 'fs';
import { checkAvailability } from './checkAvailability.js';

const alertsPath = './data/alerts.json';

export async function runAlertChecks(discordClient) {
  const alerts = JSON.parse(fs.readFileSync(alertsPath, 'utf8'));

  for (const alert of alerts) {
    const { userId, restaurant, date, time, partySize } = alert;
    const times = await checkAvailability(restaurant, date, time, partySize);

    if (times.length > 0) {
      const user = await discordClient.users.fetch(userId);
      await user.send(`🎉 A reservation is available at **${restaurant}** on **${date}** around **${time}** for **${partySize}** people!
Available times:
${times.join('\n')}`);
    }
  }
}
