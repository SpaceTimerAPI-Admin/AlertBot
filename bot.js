
import { Client, GatewayIntentBits, Events, REST, Routes, SlashCommandBuilder } from 'discord.js';
import { config } from 'dotenv';
import fs from 'fs';
import { runAlertChecks } from './alertChecker.js';

config();

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const GUILD_ID = process.env.DISCORD_GUILD_ID;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const alertsPath = './data/alerts.json';
if (!fs.existsSync('./data')) fs.mkdirSync('./data');
if (!fs.existsSync(alertsPath)) fs.writeFileSync(alertsPath, '[]');

const commands = [
  new SlashCommandBuilder()
    .setName('request')
    .setDescription('Set up a Disney dining alert')
    .addStringOption(opt => opt.setName('restaurant').setDescription('Restaurant name').setRequired(true))
    .addStringOption(opt => opt.setName('date').setDescription('Date (YYYY-MM-DD)').setRequired(true))
    .addStringOption(opt => opt.setName('time').setDescription('Time (e.g. 6:00 PM)').setRequired(true))
    .addIntegerOption(opt => opt.setName('party').setDescription('Party size').setRequired(true))
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
    console.log('✅ Slash commands registered');
  } catch (err) {
    console.error('❌ Failed to register commands:', err);
  }
})();

client.once(Events.ClientReady, c => {
  console.log(`🤖 Bot ready as ${c.user.tag}`);

  setInterval(() => {
    runAlertChecks(client);
  }, 5 * 60 * 1000); // every 5 min
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'request') {
    const restaurant = interaction.options.getString('restaurant');
    const date = interaction.options.getString('date');
    const time = interaction.options.getString('time');
    const party = interaction.options.getInteger('party');

    const newAlert = {
      userId: interaction.user.id,
      restaurant,
      date,
      time,
      partySize: party
    };

    const alerts = JSON.parse(fs.readFileSync(alertsPath, 'utf8'));
    alerts.push(newAlert);
    fs.writeFileSync(alertsPath, JSON.stringify(alerts, null, 2));

    await interaction.reply({ content: `✅ You're set! We'll alert you when ${restaurant} has availability on ${date} around ${time}.`, ephemeral: true });
  }
});

client.login(TOKEN);
