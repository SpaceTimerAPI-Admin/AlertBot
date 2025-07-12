import { Client, GatewayIntentBits, Partials, Routes, REST, SlashCommandBuilder, InteractionType } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  partials: [Partials.Channel],
});

const commands = [
  new SlashCommandBuilder()
    .setName('request')
    .setDescription('Start a Disney dining alert request')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('✅ Registering slash command...');
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
    console.log('✅ Slash command registered.');
  } catch (error) {
    console.error('❌ Error registering commands:', error);
  }
})();

client.once('ready', () => {
  console.log(`🤖 Bot ready as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'request') {
    await interaction.deferReply({ ephemeral: true });

    await interaction.editReply({
      content: 'Hi! Let’s get started with your Disney dining alert.
What restaurant are you looking for? (e.g., Ohana)'
    });

    // Additional interactive flow would continue here...
  }
});

client.login(process.env.DISCORD_TOKEN);
