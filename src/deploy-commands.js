// src/deploy-commands.js
import pkg from 'discord.js';
const { REST, Routes, SlashCommandBuilder } = pkg;

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const commands = [];
const commandsPath = path.resolve(process.cwd(), 'src', 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
  // each command module should export `data` (a SlashCommandBuilder) and `execute`
  const { data } = await import(path.join(commandsPath, file));
  commands.push(data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('⏳ Refreshing application (/) commands...');
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );
    console.log('✅ Successfully reloaded application (/) commands.');
  } catch (err) {
    console.error(err);
  }
})();
