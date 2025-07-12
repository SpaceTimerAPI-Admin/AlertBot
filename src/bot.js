import pkg from 'discord.js';
import dotenv from 'dotenv';
import { registerCommands } from './deploy-commands.js';
import { disneyLogin } from './disneyAuth.js';
import { getLocations, getRestaurants } from './disneyRestaurants.js';

const { Client, GatewayIntentBits, ActionRowBuilder, SelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = pkg;

dotenv.config();
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once('ready', async () => {
  console.log(`🤖 Bot ready as ${client.user.tag}`);
  await registerCommands(clientId, guildId, token);
  try {
    await disneyLogin();
    console.log('✅ Disney logged in');
  } catch (err) {
    console.error('❌ Disney login failed', err);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isChatInputCommand() && interaction.commandName === 'request') {
    const locations = await getLocations();
    const menu = new SelectMenuBuilder()
      .setCustomId('select_location')
      .setPlaceholder('Choose a resort or park')
      .addOptions(locations.map(loc => ({ label: loc.name, value: loc.id })));
    const row = new ActionRowBuilder().addComponents(menu);
    await interaction.reply({ content: 'Where is your restaurant?', components: [row], ephemeral: true });
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isSelectMenu()) return;

  if (interaction.customId === 'select_location') {
    const locationId = interaction.values[0];
    const restaurants = await getRestaurants(locationId);
    const menu = new SelectMenuBuilder()
      .setCustomId('select_restaurant')
      .setPlaceholder('Choose a restaurant')
      .addOptions(restaurants.map(r => ({ label: r.name, value: r.id })));
    const row = new ActionRowBuilder().addComponents(menu);
    return interaction.update({ content: `Location: **${interaction.values[0]}**\nNow choose a restaurant:`, components: [row] });
  }

  if (interaction.customId === 'select_restaurant') {
    const restaurantId = interaction.values[0];
    const modal = new ModalBuilder()
      .setCustomId(`modal_${restaurantId}`)
      .setTitle('Reservation Alert Details');
    const dateInput = new TextInputBuilder()
      .setCustomId('date')
      .setLabel('Date (YYYY-MM-DD)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('2025-07-13');
    const mealInput = new TextInputBuilder()
      .setCustomId('meal')
      .setLabel('Meal Period (Breakfast/Lunch/Dinner)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Dinner');
    const partyInput = new TextInputBuilder()
      .setCustomId('partySize')
      .setLabel('Party Size')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('2');
    modal.addComponents(
      new ActionRowBuilder().addComponents(dateInput),
      new ActionRowBuilder().addComponents(mealInput),
      new ActionRowBuilder().addComponents(partyInput),
    );
    return interaction.showModal(modal);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isModalSubmit()) return;
  const [, restaurantId] = interaction.customId.split('_');
  const date = interaction.fields.getTextInputValue('date');
  const meal = interaction.fields.getTextInputValue('meal');
  const partySize = interaction.fields.getTextInputValue('partySize');
  await interaction.reply({ content: `🔔 Alert set for restaurant **${restaurantId}** on **${date}** for **${meal}** (party of ${partySize}).`, ephemeral: true });
});

client.login(token);
