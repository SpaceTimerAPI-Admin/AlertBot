// Corrected bot.js
import { Client, GatewayIntentBits, Events, REST, Routes, SlashCommandBuilder } from 'discord.js';
import dotenv from 'dotenv';
import { fetchRestaurants } from './disneyRestaurants.js';
import { loginToDisney } from './disneyAuth.js';
import { startAlertChecker } from './alertChecker.js';

dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, async c => {
  console.log(`🤖 Bot ready as ${c.user.tag}`);

  try {
    const restaurants = await fetchRestaurants();
    console.log(`✅ Loaded ${restaurants.length} restaurants.`);

    startAlertChecker(restaurants); // Launch availability loop
  } catch (error) {
    console.error('❌ Failed to start alert checker:', error);
  }
});

const commands = [
  new SlashCommandBuilder()
    .setName('request')
    .setDescription('Set a Disney Dining Alert')
    .addStringOption(option =>
      option.setName('park').setDescription('Resort or Park').setRequired(true))
    .addStringOption(option =>
      option.setName('restaurant').setDescription('Restaurant name').setRequired(true))
    .addStringOption(option =>
      option.setName('date').setDescription('Date (YYYY-MM-DD)').setRequired(true))
    .addStringOption(option =>
      option.setName('time').setDescription('Time (e.g., 6:00 PM)').setRequired(true))
    .addIntegerOption(option =>
      option.setName('party').setDescription('Party size').setRequired(true))
]
.map(command => command.toJSON());

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('📨 Registering slash commands...');
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log('✅ Slash command registered.');
  } catch (error) {
    console.error(error);
  }
})();

client.login(process.env.DISCORD_TOKEN);
