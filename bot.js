import { Client, GatewayIntentBits, Events, REST, Routes, SlashCommandBuilder } from 'discord.js';
import dotenv from 'dotenv';
import { loginToDisney } from './disneyAuth.js';

dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commands = [
  new SlashCommandBuilder()
    .setName('request')
    .setDescription('Request a Disney dining alert'),
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('✅ Slash command registered.');
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands,
    });
  } catch (error) {
    console.error(error);
  }
})();

client.once(Events.ClientReady, () => {
  console.log(`🤖 Bot ready as ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'request') {
    await interaction.reply({ content: 'Hi! Let's get started with your Disney dining alert. (Full interactive flow coming soon!)', ephemeral: true });
  }
});

loginToDisney(); // This is just a placeholder for now

client.login(process.env.DISCORD_TOKEN);
