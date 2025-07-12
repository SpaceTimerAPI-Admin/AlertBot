import { Client, GatewayIntentBits, Events } from 'discord.js';
import dotenv from 'dotenv';
import { checkAllAlerts } from './alertChecker.js';
import { getAllRestaurantNames } from './disneyRestaurants.js';
import { loginToDisney } from './disneyAuth.js';

dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, async () => {
  console.log(`🤖 Bot ready as ${client.user.tag}`);

  await loginToDisney(); // Login once at startup
  setInterval(checkAllAlerts, 1000 * 60 * 5); // Check alerts every 5 minutes
});

client.login(process.env.DISCORD_TOKEN);
