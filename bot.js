import { Client, GatewayIntentBits, Partials, REST, Routes, ActionRowBuilder, StringSelectMenuBuilder, SlashCommandBuilder, Events } from 'discord.js';
import dotenv from 'dotenv';
import fs from 'fs';
import fetch from 'node-fetch';
import { loginToDisney } from './disneyAuth.js';
import { checkAvailability } from './alertChecker.js';

dotenv.config();
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages],
  partials: [Partials.Channel]
});

let restaurants = {};
let alerts = [];

function loadAlerts() {
  alerts = JSON.parse(fs.readFileSync('./alerts.json'));
}
function saveAlerts() {
  fs.writeFileSync('./alerts.json', JSON.stringify(alerts, null, 2));
}

async function fetchRestaurantData() {
  const url = "https://disneyworld.disney.go.com/finder/api/v1/explorer-service/list-ancestor-entities/80007798";
  const res = await fetch(url);
  const data = await res.json();

  if (!Array.isArray(data)) {
    console.error("❌ Disney API returned unexpected data:", data);
    return;
  }

  const filtered = data.filter(item => item.entityType === 'restaurant' || item.entityType === 'experience');
  const categorized = {};
  for (const item of filtered) {
    const location = item?.ancestorNames?.[0] || "Other";
    if (!categorized[location]) categorized[location] = [];
    categorized[location].push({ name: item.name, id: item.id });
  }

  fs.writeFileSync('./data/restaurants.json', JSON.stringify(categorized, null, 2));
  restaurants = categorized;
}

client.once('ready', async () => {
  console.log(`🤖 Bot ready as ${client.user.tag}`);
  await fetchRestaurantData();
  await loginToDisney();
  loadAlerts();
  setInterval(runChecks, 5 * 60 * 1000);
  setInterval(loginToDisney, 30 * 60 * 1000);
});

client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isChatInputCommand() && interaction.commandName === 'request') {
    const options = Object.keys(restaurants).slice(0, 25).map(loc => ({ label: loc, value: loc }));
    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('select_location')
        .setPlaceholder('Select a Park or Resort')
        .addOptions(options)
    );
    await interaction.reply({ content: 'Select a location:', components: [row], ephemeral: true });
  }

  if (interaction.isStringSelectMenu()) {
    if (interaction.customId === 'select_location') {
      const loc = interaction.values[0];
      const options = restaurants[loc]?.slice(0, 25).map(r => ({ label: r.name, value: r.id })) || [];
      const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('select_restaurant')
          .setPlaceholder('Select a Restaurant')
          .addOptions(options)
      );
      await interaction.update({ content: 'Pick a restaurant:', components: [row] });
    } else if (interaction.customId === 'select_restaurant') {
      const restaurantId = interaction.values[0];
      const user = await interaction.user.createDM();
      await user.send("📅 What date? (YYYY-MM-DD)");
      const dateMsg = await waitForReply(user);
      await user.send("⏰ What time? (e.g. 6:00 PM)");
      const timeMsg = await waitForReply(user);
      await user.send("👥 Party size?");
      const partyMsg = await waitForReply(user);
      alerts.push({
        userId: interaction.user.id,
        restaurantId,
        date: dateMsg.content,
        time: timeMsg.content,
        partySize: parseInt(partyMsg.content)
      });
      saveAlerts();
      await user.send("🔔 You're all set. I'll check every 5 minutes and DM you if a spot opens.");
      await interaction.update({ content: '✅ Alert set!', components: [] });
    }
  }
});

async function waitForReply(user) {
  return new Promise(resolve => {
    const collector = user.dmChannel.createMessageCollector({ max: 1, time: 60000 });
    collector.on('collect', msg => resolve(msg));
  });
}

async function runChecks() {
  const today = new Date().toISOString().split('T')[0];
  alerts = alerts.filter(a => a.date >= today);
  for (const alert of alerts) {
    const found = await checkAvailability(alert.restaurantId, alert.date, alert.partySize);
    if (found) {
      const user = await client.users.fetch(alert.userId);
      await user.send(
        `🍽️ Reservation found!
✅ Available for ${alert.partySize} on ${alert.date} at ${alert.time}
🔗 [Book Now](https://disneyworld.disney.go.com/dining/)`
      );
    }
  }
  saveAlerts();
}

const commands = [
  new SlashCommandBuilder().setName('request').setDescription('Track a Disney dining alert')
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands })
  .then(() => console.log('✅ Slash command registered.'))
  .catch(console.error);

client.login(process.env.DISCORD_TOKEN);
