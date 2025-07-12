import { Client, GatewayIntentBits, Events, ActionRowBuilder, SelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { DISCORD_TOKEN } from './config.js';
import { fetchRestaurants } from './disneyRestaurants.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const locations = ['Magic Kingdom', 'EPCOT', 'Hollywood Studios', 'Animal Kingdom', 'Resorts'];

client.once(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === 'request') {
      const row = new ActionRowBuilder().addComponents(
        new SelectMenuBuilder()
          .setCustomId('selectLocation')
          .setPlaceholder('Select Resort or Park')
          .addOptions(locations.map(loc => ({ label: loc, value: loc })))
      );
      await interaction.reply({ content: 'Choose a location:', components: [row], ephemeral: true });
    }
  } else if (interaction.isSelectMenu()) {
    if (interaction.customId === 'selectLocation') {
      const location = interaction.values[0];
      await interaction.update({ content: `Location: **${location}**\nLoading restaurants...`, components: [] });
      let restaurants;
      try {
        restaurants = await fetchRestaurants(location);
      } catch (e) {
        return interaction.followUp({ content: `Error fetching restaurants: ${e.message}`, ephemeral: true });
      }
      const restRow = new ActionRowBuilder().addComponents(
        new SelectMenuBuilder()
          .setCustomId('selectRestaurant')
          .setPlaceholder('Select Restaurant')
          .addOptions(restaurants.map(r => ({ label: r.name, value: r.id })))
      );
      return interaction.followUp({ content: `Location: **${location}**\nNow choose a restaurant:`, components: [restRow], ephemeral: true });
    } else if (interaction.customId === 'selectRestaurant') {
      const restaurantId = interaction.values[0];
      const modal = new ModalBuilder()
        .setCustomId(`modal_${restaurantId}`)
        .setTitle('Dining Alert Details');
      const dateInput = new TextInputBuilder()
        .setCustomId('dateInput')
        .setLabel('Date (YYYY-MM-DD)')
        .setStyle(TextInputStyle.Short);
      const mealInput = new TextInputBuilder()
        .setCustomId('mealInput')
        .setLabel('Meal period (Breakfast/Lunch/Dinner)')
        .setStyle(TextInputStyle.Short);
      const partyInput = new TextInputBuilder()
        .setCustomId('partyInput')
        .setLabel('Party size')
        .setStyle(TextInputStyle.Short);
      modal.addComponents(
        new ActionRowBuilder().addComponents(dateInput),
        new ActionRowBuilder().addComponents(mealInput),
        new ActionRowBuilder().addComponents(partyInput)
      );
      await interaction.showModal(modal);
    }
  } else if (interaction.isModalSubmit()) {
    const restaurantId = interaction.customId.split('_')[1];
    const date = interaction.fields.getTextInputValue('dateInput');
    const meal = interaction.fields.getTextInputValue('mealInput');
    const partySize = interaction.fields.getTextInputValue('partyInput');
    await interaction.reply({ content: `Alert set for restaurant ${restaurantId} on ${date}, meal: ${meal}, party: ${partySize}`, ephemeral: true });
    // TODO: implement scheduling logic
  }
});

client.login(DISCORD_TOKEN);
