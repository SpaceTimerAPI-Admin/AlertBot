import pkg from 'discord.js';
const { Client, GatewayIntentBits, ActionRowBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === 'request') {
    // Build location selector
    const locations = ['Magic Kingdom', 'EPCOT', 'Hollywood Studios', 'Animal Kingdom'];
    const locMenu = new StringSelectMenuBuilder()
      .setCustomId('select_location')
      .setPlaceholder('Select a park or resort')
      .addOptions(locations.map(loc => ({ label: loc, value: loc })));

    const row = new ActionRowBuilder().addComponents(locMenu);
    await interaction.showModal(
      new ModalBuilder()
        .setCustomId('modal_request')
        .setTitle('Set Your Dining Alert')
        .addComponents(
          row,
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('date')
              .setLabel('Date (YYYY-MM-DD)')
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('meal')
              .setLabel('Meal Period (Breakfast, Lunch, Dinner)')
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
          )
        )
    );
  }
});

client.on('interactionCreate', async interaction => {
  if (interaction.isModalSubmit() && interaction.customId === 'modal_request') {
    const date = interaction.fields.getTextInputValue('date');
    const meal = interaction.fields.getTextInputValue('meal');
    await interaction.reply({ content: `✅ Alert set for ${date} during ${meal}.`, ephemeral: true });
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
