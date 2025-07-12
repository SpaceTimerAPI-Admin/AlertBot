import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('request')
  .setDescription('Create a new dining availability watch');

export async function execute(interaction) {
  // Handled by bot.js modal
}
