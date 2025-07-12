import { Client, GatewayIntentBits, REST, Routes, Partials, InteractionType, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import dotenv from 'dotenv';
import { handleAvailabilityCheck } from './scraper.js';

dotenv.config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
    partials: [Partials.Channel],
});

const commands = [
    {
        name: 'request',
        description: 'Set an alert for a Disney dining reservation',
    },
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('Registering slash commands...');
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );
        console.log('✅ Slash commands registered.');
    } catch (error) {
        console.error('Failed to register commands:', error);
    }
})();

client.once('ready', () => {
    console.log(`🤖 Bot ready as ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
    if (interaction.isChatInputCommand() && interaction.commandName === 'request') {
        const modal = new ModalBuilder()
            .setCustomId('diningRequest')
            .setTitle('Set Your Dining Alert')
            .addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('restaurant')
                        .setLabel('Restaurant Name')
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
                        .setCustomId('time')
                        .setLabel('Preferred Time (e.g., 6:30 PM)')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                )
            );
        await interaction.showModal(modal);
    }

    if (interaction.type === InteractionType.ModalSubmit && interaction.customId === 'diningRequest') {
        const restaurant = interaction.fields.getTextInputValue('restaurant');
        const date = interaction.fields.getTextInputValue('date');
        const time = interaction.fields.getTextInputValue('time');

        await interaction.reply({
            content: `✅ You're set! We'll alert you when **${restaurant}** has availability on **${date}** around **${time}**.`,
            ephemeral: true,
        });

        handleAvailabilityCheck(restaurant, date, time, interaction.user);
    }
});

client.login(process.env.DISCORD_TOKEN);