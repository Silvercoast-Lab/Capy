const { EmbedBuilder, ApplicationCommandOptionType } = require('discord.js');
const formatDuration = require('../../structures/FormatDuration.js');
const { SlashPage } = require('../../structures/PageQueue.js');

module.exports = {
    name: ["queue"], // I move play to main issues subcmd (max 25)
    description: "Show the queue of songs.",
    category: "Music",
    options: [
        {
            name: "page",
            description: "Page number to show.",
            type: ApplicationCommandOptionType.Integer,
            required: false,
        }
    ],
    run: async (interaction, client, user, language) => {
        await interaction.deferReply({ ephemeral: false });        
        const value = interaction.options.getInteger("page");
        const player = client.manager.get(interaction.guild.id);

        const noplayer = new EmbedBuilder()
        .setTitle(`${client.i18n.get(language, "noplayer", "no_player_title")}`)
        .setDescription(`${client.i18n.get(language, "noplayer", "no_player")}`)
        .setColor(client.color)
        .setTimestamp();

        const novoice = new EmbedBuilder()
        .setTitle(`${client.i18n.get(language, "noplayer", "no_player_title")}`)
        .setDescription(`${client.i18n.get(language, "noplayer", "no_player")}`)
        .setColor(client.color)
        .setTimestamp();

		if (!player) return interaction.editReply({ embeds: [noplayer]});
        const { channel } = interaction.member.voice;
        if (!channel || interaction.member.voice.channel !== interaction.guild.members.me.voice.channel) return interaction.editReply({ embeds: [novoice] });

        const song = player.queue.current;
        const qduration = `${formatDuration(player.queue.duration)}`;
        const thumbnail = `https://img.youtube.com/vi/${song.identifier}/hqdefault.jpg`;

        let pagesNum = Math.ceil(player.queue.length / 10);
        if(pagesNum === 0) pagesNum = 1;

        const songStrings = [];
        for (let i = 0; i < player.queue.length; i++) {
            const song = player.queue[i];
            songStrings.push(
                `**${i + 1}.** [${song.title}](${song.uri}) \`[${formatDuration(song.duration)}]\` • ${song.requester}
                `);
        }

        const pages = [];
        for (let i = 0; i < pagesNum; i++) {
            const str = songStrings.slice(i * 10, i * 10 + 10).join('');

            const embed = new EmbedBuilder()
                .setAuthor({ name: `${client.i18n.get(language, "music", "queue_author", {
                    guild: interaction.guild.name,
                })}`, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                .setThumbnail(thumbnail)
                .setColor(client.color)
                .setDescription(`${client.i18n.get(language, "music", "queue_description", {
                    title: song.title,
                    url: song.uri,
                    duration: formatDuration(song.duration),
                    request: song.requester,
                    rest: str == '' ? '  Nothing' : '\n' + str,
                })}`)
                .setFooter({ text: `${client.i18n.get(language, "music", "queue_footer", {
                    page: i + 1,
                    pages: pagesNum,
                    queue_lang: player.queue.length,
                    duration: qduration,
                })}` });

            pages.push(embed);
        }

        const nopages = new EmbedBuilder()
        .setColor(client.color)
        .setDescription(`${client.i18n.get(language, "music", "queue_page_notfound", {
            page: pagesNum,
        })}`);

        if (!value) {
            if (pages.length == pagesNum && player.queue.length > 10) SlashPage(client, interaction, pages, 60000, player.queue.length, qduration, language);
            else return interaction.editReply({ embeds: [pages[0]] });
        } else {
            if (isNaN(value)) return interaction.editReply(`${client.i18n.get(language, "music", "queue_notnumber")}`);
            if (value > pagesNum) return interaction.editReply({ embeds: [nopages] });
            const pageNum = value == 0 ? 1 : value - 1;
            return interaction.editReply({ embeds: [pages[pageNum]] });
        }
    }
}