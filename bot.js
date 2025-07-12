import { Client, GatewayIntentBits, Events, Partials, REST, Routes, SlashCommandBuilder } from 'discord.js';
import fs from 'fs';
import dotenv from 'dotenv';
import { loginToDisney } from './disneyAuth.js';
import { checkAvailability } from './scraper.js';
import { scheduleJob } from 'node-schedule';
import alerts from './alerts.js';

dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  partials: [Partials.Channel]
});

const commands = [
  new SlashCommandBuilder()
    .setName('request')
    .setDescription('Set a dining alert')
    .addStringOption(option =>
      option.setName('restaurant')
        .setDescription('Restaurant name')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('date')
        .setDescription('Date (YYYY-MM-DD)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('time')
        .setDescription('Preferred time (e.g., 6:00 PM)')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('party')
        .setDescription('Party size')
        .setRequired(true))
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

async function registerCommands() {
  try {
    await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands });
    console.log('✅ Slash command registered.');
  } catch (error) {
    console.error(error);
  }
}

client.once(Events.ClientReady, async () => {
  console.log(`🤖 Bot ready as ${client.user.tag}`);
  await registerCommands();
  await loginToDisney();
  scheduleJob('*/5 * * * *', () => alerts.run(client));
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, options, user } = interaction;
  if (commandName === 'request') {
    const restaurant = options.getString('restaurant');
    const date = options.getString('date');
    const time = options.getString('time');
    const party = options.getInteger('party');
    await alerts.add(user.id, restaurant, date, time, party);
    await interaction.reply({ content: '✅ Alert saved. You will be notified if a reservation opens!', ephemeral: true });
  }
});

client.login(process.env.DISCORD_TOKEN);