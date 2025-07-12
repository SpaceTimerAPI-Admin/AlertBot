import pkg from 'discord.js';
const { SlashCommandBuilder } = pkg;

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Replies with Pong!');

export async function execute(interaction) {
  await interaction.reply('Pong!');
}
