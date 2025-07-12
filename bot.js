import 'dotenv/config';
import { Client, GatewayIntentBits, Partials } from 'discord.js';

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  partials: [Partials.Channel]
});

client.once('ready', () => {
  console.log(`🤖 Bot ready as ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);