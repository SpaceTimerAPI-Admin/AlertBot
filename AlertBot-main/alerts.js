import fs from 'fs';
import { checkAvailability } from './scraper.js';

const alertsFile = './session/alerts.json';
let alerts = fs.existsSync(alertsFile) ? JSON.parse(fs.readFileSync(alertsFile)) : [];

function saveAlerts() {
  fs.writeFileSync(alertsFile, JSON.stringify(alerts));
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

export default {
  async add(userId, restaurant, date, time, party) {
    alerts.push({ userId, restaurant, date, time, party });
    saveAlerts();
  },

  async run(client) {
    const now = new Date();
    const today = formatDate(now);

    alerts = alerts.filter(alert => alert.date >= today);
    for (const alert of alerts) {
      const available = await checkAvailability(alert.restaurant, alert.date, alert.party);
      if (available.includes(alert.time)) {
        const user = await client.users.fetch(alert.userId);
        user.send(`🍽️ A reservation at **${alert.restaurant}** is available on ${alert.date} at ${alert.time} for ${alert.party} people!
Book now: https://disneyworld.disney.go.com/dining/`);
      }
    }
    saveAlerts();
  }
};