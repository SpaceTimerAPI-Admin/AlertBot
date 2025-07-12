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
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

client.commands = new Collection();
// load each command into client.commands
import fs from 'fs';
import path from 'path';
const commandsPath = path.resolve(process.cwd(), 'src', 'commands');
for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'))) {
  const { data, execute } = await import(path.join(commandsPath, file));
  client.commands.set(data.name, { data, execute });
}

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand()) {
    const cmd = client.commands.get(interaction.commandName);
    if (!cmd) return;
    try {
      await cmd.execute(interaction);
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: '❌ There was an error while executing that command.', flags: InteractionResponseFlags.Ephemeral });
    }
  }
  // handle select menus & modals here...
});

client.login(process.env.DISCORD_TOKEN);
