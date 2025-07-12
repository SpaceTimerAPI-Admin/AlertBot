// src/bot.js
import pkg from 'discord.js';
const {
  Client,
  Collection,
  GatewayIntentBits,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  InteractionResponseFlags
} = pkg;

import { loginToDisney } from './disneyAuth.js';
import { watchAvailability } from './watcher.js';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

client.commands = new Collection();
// ... load your commands into client.commands ...

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;
  if (commandName === 'request') {
    // build and show your initial modal or select menus here
  }
  // ... rest of your interaction handling ...
});

client.login(process.env.DISCORD_TOKEN);
