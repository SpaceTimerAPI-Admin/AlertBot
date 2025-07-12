// Main entry
import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, InteractionType } from 'discord.js';
import dotenv from 'dotenv';
import { getRestaurantsByLocation } from './restaurants.js';
dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const COMMAND = new SlashCommandBuilder()
  .setName('request')
  .setDescription('Set up a Disney dining alert');

client.once('ready', () => {
  console.log(`🤖 Bot ready as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand() && interaction.commandName === 'request') {
    const modal = new ModalBuilder()
      .setCustomId('dining_request')
      .setTitle('Set Your Dining Alert')
      .addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('location')
            .setLabel('Location (e.g., Magic Kingdom, EPCOT)')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('restaurant')
            .setLabel('Restaurant Name (based on location)')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('date')
            .setLabel('Date (MM/DD/YYYY)')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('meal_period')
            .setLabel('Meal Period (Breakfast, Lunch, Dinner)')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
        )
      );

    await interaction.showModal(modal);
  } else if (interaction.type === InteractionType.ModalSubmit && interaction.customId === 'dining_request') {
    const location = interaction.fields.getTextInputValue('location');
    const restaurant = interaction.fields.getTextInputValue('restaurant');
    const date = interaction.fields.getTextInputValue('date');
    const meal = interaction.fields.getTextInputValue('meal_period');

    await interaction.reply({
      content: `✅ You're set! We'll alert you when **${restaurant}** has availability on **${date}** for **${meal}**.`,
      ephemeral: true
    });
  }
});

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
(async () => {
  try {
    console.log('Registering slash command...');
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: [COMMAND.toJSON()]
    });
    client.login(process.env.DISCORD_TOKEN);
  } catch (err) {
    console.error(err);
  }
})();
