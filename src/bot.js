import pkg from 'discord.js';
const { Client, GatewayIntentBits, Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, c => {
  console.log(`✅ Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === 'request') {
      // Build modal
      const modal = new ModalBuilder()
        .setCustomId('requestModal')
        .setTitle('New Watch Request');
      // Inputs
      const locationInput = new TextInputBuilder()
        .setCustomId('locationInput')
        .setLabel('Resort or Park')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('e.g., Magic Kingdom');
      const restaurantInput = new TextInputBuilder()
        .setCustomId('restaurantInput')
        .setLabel('Restaurant Name')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('e.g., Be Our Guest');
      const dateInput = new TextInputBuilder()
        .setCustomId('dateInput')
        .setLabel('Date (YYYY-MM-DD)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('2025-08-01');
      const mealInput = new TextInputBuilder()
        .setCustomId('mealInput')
        .setLabel('Meal Period (Breakfast, Lunch, Dinner)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Lunch');
      // Action rows
      modal.addComponents(
        new ActionRowBuilder().addComponents(locationInput),
        new ActionRowBuilder().addComponents(restaurantInput),
        new ActionRowBuilder().addComponents(dateInput),
        new ActionRowBuilder().addComponents(mealInput)
      );
      await interaction.showModal(modal);
    }
  } else if (interaction.isModalSubmit()) {
    if (interaction.customId === 'requestModal') {
      const location = interaction.fields.getTextInputValue('locationInput');
      const restaurant = interaction.fields.getTextInputValue('restaurantInput');
      const date = interaction.fields.getTextInputValue('dateInput');
      const meal = interaction.fields.getTextInputValue('mealInput');
      await interaction.reply({ content: `Watching **${restaurant}** at **${location}** on **${date}** for **${meal}**`, ephemeral: true });
      // TODO: schedule the watch logic
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
