import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('request')
  .setDescription('Set a Disney dining alert');

export async function execute(interaction) {
  // Placeholder: implement interaction logic here
  await interaction.reply({ content: 'Request feature coming soon!', ephemeral: true });
}
