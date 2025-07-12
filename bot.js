import pkg from 'discord.js';
const { Client, Collection, GatewayIntentBits, ActionRowBuilder, SelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = pkg;
import dotenv from 'dotenv'; dotenv.config();
import { loginDisney } from './disneyAuth.js';
import { getLocations, getRestaurantsForLocation, checkAvailability } from './disneyAPI.js';

const client = new Client({ intents: [ GatewayIntentBits.Guilds ] });
client.commands = new Collection();

client.once('ready', async () => {
  console.log(`🤖 Bot ready as ${client.user.tag}`);
  await loginDisney();
  await client.application.commands.set([{
    name: 'request',
    description: 'Create a Disney dining availability alert'
  }], process.env.GUILD_ID);
});

client.on('interactionCreate', async interaction => {
  try {
    if (interaction.isChatInputCommand() && interaction.commandName === 'request') {
      const locations = await getLocations();
      const locRow = new ActionRowBuilder().addComponents(
        new SelectMenuBuilder()
          .setCustomId('select_location')
          .setPlaceholder('Select a park or resort')
          .addOptions(locations.map(l => ({ label: l, value: l })))
      );
      return interaction.reply({ content: 'Choose your location:', components: [locRow], ephemeral: true });
    }

    if (interaction.isSelectMenu() && interaction.customId === 'select_location') {
      const restaurants = await getRestaurantsForLocation(interaction.values[0]);
      const restRow = new ActionRowBuilder().addComponents(
        new SelectMenuBuilder()
          .setCustomId('select_restaurant')
          .setPlaceholder('Select a restaurant')
          .addOptions(restaurants.map(r => ({ label: r.name, value: r.id })))
      );
      return interaction.update({ content: \`Location: **\${interaction.values[0]}**\nNow choose a restaurant:\`, components: [restRow] });
    }

    if (interaction.isSelectMenu() && interaction.customId === 'select_restaurant') {
      const modal = new ModalBuilder()
        .setCustomId(\`modal_\${interaction.values[0]}\`)
        .setTitle(\`Alert for \${interaction.values[0]}\`)
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('date')
              .setLabel('Date (YYYY-MM-DD)')
              .setStyle(TextInputStyle.Short)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('meal')
              .setLabel('Meal period (breakfast|lunch|dinner)')
              .setStyle(TextInputStyle.Short)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('party')
              .setLabel('Party size')
              .setStyle(TextInputStyle.Short)
          )
        );
      return interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_')) {
      const restaurantId = interaction.customId.replace('modal_', '');
      const date = interaction.fields.getTextInputValue('date');
      const meal = interaction.fields.getTextInputValue('meal').toLowerCase();
      const party = parseInt(interaction.fields.getTextInputValue('party'), 10);
      checkAvailability(restaurantId, date, meal, party, interaction.user);
      return interaction.reply({ content: \`✅ Alert set for **\${restaurantId}** on **\${date}** (\${meal}, party of \${party}). I will DM you when availability opens!\`, ephemeral: true });
    }
  } catch (err) {
    console.error(err);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: '❌ Oops, something went wrong. Please try again.', ephemeral: true });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
