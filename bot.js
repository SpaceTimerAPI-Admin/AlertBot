import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, InteractionType, ActionRowBuilder, StringSelectMenuBuilder, Events } from 'discord.js';
import dotenv from 'dotenv';
import { getRestaurantsByLocation, watchForAvailability } from './scraper.js';

dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const locations = [
  { label: "Magic Kingdom", value: "Magic Kingdom" },
  { label: "EPCOT", value: "EPCOT" },
  { label: "Hollywood Studios", value: "Hollywood Studios" },
  { label: "Animal Kingdom", value: "Animal Kingdom" },
  { label: "Disney Springs", value: "Disney Springs" },
  { label: "Contemporary Resort", value: "Contemporary Resort" },
  { label: "Grand Floridian", value: "Grand Floridian" },
  { label: "Polynesian", value: "Polynesian" }
];

const meals = [
  { label: "Breakfast", value: "breakfast" },
  { label: "Lunch", value: "lunch" },
  { label: "Dinner", value: "dinner" }
];

client.once(Events.ClientReady, async () => {
  console.log(`🤖 Bot ready as ${client.user.tag}`);

  const commands = [
    new SlashCommandBuilder()
      .setName('request')
      .setDescription('Set a dining alert')
  ].map(command => command.toJSON());

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  try {
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
  } catch (error) {
    console.error(error);
  }
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand() || interaction.commandName !== 'request') return;

  const locationMenu = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('select_location')
      .setPlaceholder('Choose a Resort or Park')
      .addOptions(locations)
  );

  await interaction.reply({ content: 'Select your Resort or Park:', components: [locationMenu], ephemeral: true });
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isStringSelectMenu()) return;

  if (interaction.customId === 'select_location') {
    const location = interaction.values[0];
    const restaurants = await getRestaurantsByLocation(location);
    const restaurantMenu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('select_restaurant')
        .setPlaceholder('Choose a Restaurant')
        .addOptions(restaurants.map(r => ({ label: r.name, value: r.id })))
    );
    await interaction.update({ content: 'Now select a restaurant:', components: [restaurantMenu] });
  } else if (interaction.customId === 'select_restaurant') {
    const mealMenu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('select_meal')
        .setPlaceholder('Choose a Meal Period')
        .addOptions(meals)
    );
    await interaction.update({ content: 'Choose a meal period:', components: [mealMenu] });
  } else if (interaction.customId === 'select_meal') {
    await interaction.update({ content: `✅ You're set! We'll alert you when availability opens.`, components: [] });
  }
});

client.login(process.env.DISCORD_TOKEN);
