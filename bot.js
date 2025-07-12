// bot.js
import { Client, GatewayIntentBits, REST, Routes, Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, SlashCommandBuilder, InteractionType } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commands = [
  new SlashCommandBuilder()
    .setName('request')
    .setDescription('Request a Disney Dining alert')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('Registering slash commands...');
    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands }
    );
    console.log('Slash commands registered successfully.');
  } catch (error) {
    console.error('Error registering slash commands:', error);
  }
})();

client.once(Events.ClientReady, () => {
  console.log(`🤖 Bot ready as ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === 'request') {
    const modal = new ModalBuilder()
      .setCustomId('alertRequest')
      .setTitle('Set Dining Alert');

    const restaurantInput = new TextInputBuilder()
      .setCustomId('restaurantName')
      .setLabel('Restaurant Name')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const dateInput = new TextInputBuilder()
      .setCustomId('reservationDate')
      .setLabel('Reservation Date (YYYY-MM-DD)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('e.g., 2025-07-15')
      .setRequired(true);

    const mealInput = new TextInputBuilder()
      .setCustomId('mealPeriod')
      .setLabel('Meal Period (Breakfast, Lunch, or Dinner)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Breakfast, Lunch, or Dinner')
      .setRequired(true);

    const row1 = new ActionRowBuilder().addComponents(restaurantInput);
    const row2 = new ActionRowBuilder().addComponents(dateInput);
    const row3 = new ActionRowBuilder().addComponents(mealInput);

    modal.addComponents(row1, row2, row3);

    await interaction.showModal(modal);
  }
});

client.on(Events.InteractionCreate, async interaction => {
  if (interaction.type !== InteractionType.ModalSubmit) return;
  if (interaction.customId === 'alertRequest') {
    const restaurant = interaction.fields.getTextInputValue('restaurantName');
    const date = interaction.fields.getTextInputValue('reservationDate');
    const meal = interaction.fields.getTextInputValue('mealPeriod');

    // Future: add logic to validate, store, and begin availability checks here

    await interaction.reply({
      content: `✅ You're set! We'll alert you when **${restaurant}** has availability on **${date}** around **${meal}**.`,
      ephemeral: true
    });
  }
});

client.login(token);
