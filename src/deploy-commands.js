import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import { CLIENT_ID, GUILD_ID, DISCORD_TOKEN } from './config.js';

const commands = [
  new SlashCommandBuilder()
    .setName('request')
    .setDescription('Create a dining alert')
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');
    if (GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
        { body: commands }
      );
      console.log('Successfully reloaded guild commands.');
    } else {
      await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
      console.log('Successfully reloaded global commands.');
    }
  } catch (error) {
    console.error(error);
  }
})();
