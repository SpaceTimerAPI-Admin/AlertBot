import { Client, GatewayIntentBits, Routes, REST, InteractionType, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

const locations = {
    'Magic Kingdom': ['Cinderella’s Royal Table', 'Be Our Guest'],
    'EPCOT': ['Le Cellier', 'Space 220'],
    'Hollywood Studios': ['Sci-Fi Dine-In', '50’s Prime Time Café'],
    'Animal Kingdom': ['Tiffins', 'Yak & Yeti'],
    'Disney Springs': ['The BOATHOUSE', 'Chef Art Smith’s Homecomin’'],
    'Resorts': ['Ohana', 'California Grill', 'Boma']
};

const mealPeriods = {
    'breakfast': { start: '07:00 AM', end: '10:30 AM' },
    'lunch': { start: '11:00 AM', end: '03:30 PM' },
    'dinner': { start: '04:00 PM', end: '09:00 PM' }
};

const commands = [
    new SlashCommandBuilder()
        .setName('request')
        .setDescription('Create a new Disney dining alert.')
];

client.once('ready', () => {
    console.log(`🤖 Bot ready as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
    if (interaction.type === InteractionType.ApplicationCommand && interaction.commandName === 'request') {
        const locationSelect = new StringSelectMenuBuilder()
            .setCustomId('select_location')
            .setPlaceholder('Choose a Resort or Park')
            .addOptions(Object.keys(locations).map(loc => new StringSelectMenuOptionBuilder().setLabel(loc).setValue(loc)));

        await interaction.reply({
            content: 'Please select a Resort or Park:',
            components: [new ActionRowBuilder().addComponents(locationSelect)],
            ephemeral: true
        });
    } else if (interaction.isStringSelectMenu()) {
        const location = interaction.values[0];
        const restaurantSelect = new StringSelectMenuBuilder()
            .setCustomId(`select_restaurant:${location}`)
            .setPlaceholder('Choose a restaurant')
            .addOptions(locations[location].map(name => new StringSelectMenuOptionBuilder().setLabel(name).setValue(name)));

        await interaction.update({
            content: `Location selected: **${location}**. Now select a restaurant:`,
            components: [new ActionRowBuilder().addComponents(restaurantSelect)]
        });
    } else if (interaction.customId.startsWith('select_restaurant')) {
        const location = interaction.customId.split(':')[1];
        const restaurant = interaction.values[0];

        const mealSelect = new StringSelectMenuBuilder()
            .setCustomId(`select_meal:${restaurant}`)
            .setPlaceholder('Choose a meal period')
            .addOptions(Object.keys(mealPeriods).map(label => new StringSelectMenuOptionBuilder().setLabel(label).setValue(label)));

        await interaction.update({
            content: `Restaurant selected: **${restaurant}**. Now choose a meal period:`,
            components: [new ActionRowBuilder().addComponents(mealSelect)]
        });
    } else if (interaction.customId.startsWith('select_meal')) {
        const restaurant = interaction.customId.split(':')[1];
        const mealPeriod = interaction.values[0];

        const modal = new ModalBuilder()
            .setCustomId(`confirm_modal:${restaurant}:${mealPeriod}`)
            .setTitle('Choose a Date');

        const dateInput = new TextInputBuilder()
            .setCustomId('date')
            .setLabel('Pick a date (MM/DD/YYYY)')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('e.g., 07/20/2025')
            .setRequired(true);

        const row = new ActionRowBuilder().addComponents(dateInput);
        modal.addComponents(row);

        await interaction.showModal(modal);
    } else if (interaction.type === InteractionType.ModalSubmit && interaction.customId.startsWith('confirm_modal')) {
        const [_, restaurant, mealPeriod] = interaction.customId.split(':');
        const date = interaction.fields.getTextInputValue('date');
        await interaction.reply({
            content: `✅ You're set! We'll alert you when **${restaurant}** has availability on **${date}** around **${mealPeriod}**.`,
            ephemeral: true
        });
    }
});

(async () => {
    try {
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
    } catch (err) {
        console.error(err);
    }
    client.login(process.env.DISCORD_TOKEN);
})();