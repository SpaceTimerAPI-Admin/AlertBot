import { Client, GatewayIntentBits, Events, REST, Routes, SlashCommandBuilder, InteractionType } from 'discord.js';
import dotenv from 'dotenv';
import fs from 'fs';
import { checkAvailability } from './checkAvailability.js';

dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, c => {
  console.log(`🤖 Bot ready as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'request') {
    await interaction.reply({ content: 'Hi! Let’s get started with your Disney dining alert.

What restaurant are you looking for? (e.g., Ohana)', ephemeral: true });

    const filter = msg => msg.author.id === interaction.user.id;
    const collector = interaction.channel.createMessageCollector({ filter, time: 30000, max: 1 });

    collector.on('collect', async msg1 => {
      const restaurantName = msg1.content;

      await interaction.followUp({ content: `What date are you targeting? (MM/DD/YYYY)`, ephemeral: true });
      const collector2 = interaction.channel.createMessageCollector({ filter, time: 30000, max: 1 });

      collector2.on('collect', async msg2 => {
        const date = msg2.content;

        await interaction.followUp({ content: `What time are you targeting? (e.g., 6:00 PM)`, ephemeral: true });
        const collector3 = interaction.channel.createMessageCollector({ filter, time: 30000, max: 1 });

        collector3.on('collect', async msg3 => {
          const time = msg3.content;

          await interaction.followUp({ content: `And your party size?`, ephemeral: true });
          const collector4 = interaction.channel.createMessageCollector({ filter, time: 30000, max: 1 });

          collector4.on('collect', async msg4 => {
            const partySize = msg4.content;

            // Simulate lookup
            const available = await checkAvailability(restaurantName, date, time, partySize);
            if (available.length > 0) {
              await interaction.followUp({ content: `🎉 Found availability!
${available.join('
')}`, ephemeral: true });
            } else {
              await interaction.followUp({ content: `No availability found yet. You will be notified if something opens up!`, ephemeral: true });
            }
          });
        });
      });
    });
  }
});

client.login(process.env.DISCORD_TOKEN);