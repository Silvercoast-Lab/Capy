const { EmbedBuilder } = require("discord.js");
const axios = require('axios');

module.exports = {
  name: ["pout"],
  description: "Use this command to see random waifu",
  category: "Media",

run: async (interaction, client, user, language) => {    

    const result = await axios.get('https://api.otakugifs.xyz/gif?reaction=pout&format=gif')

    const pout = new EmbedBuilder()
      .setColor(client.color)
      .setFooter({
        text: `Request from ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setImage(result.url)
      .setTimestamp();


    interaction.reply({ embeds: [pout]})  

}
}