import dotenv from 'dotenv';
dotenv.config();

import pkg from 'discord.js';
const { Client, Collection, GatewayIntentBits, ActionRowBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = pkg;
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const { data, execute } = await import(`file://${path.join(commandsPath, file)}`);
  client.commands.set(data.name, { data, execute });
}

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'Error executing command.', ephemeral: true });
      } else {
        await interaction.reply({ content: 'Error executing command.', ephemeral: true });
      }
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
