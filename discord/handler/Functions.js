const { EmbedBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder } = require(`discord.js`);
const ec = "#3498db"

module.exports = class Functions {
  constructor(client){
    this.client = client;
  }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

  async ticketPanelSend(interaction, ticketcheck, ticketembedcheck){
    const ext = this;
    const buttonRow = await this.buttons(`📩 Open`, `ticketopen`, ButtonStyle.Success);
    let channel1 = interaction.guild.channels.cache.get(ticketcheck.channel);
    if(!ticketembedcheck){
      const embed = await ext.embedBuild().title(`Ticket`).thumbnail(`${process.env.thumbnail}`).description(`> Open Ticket By Clicking Below Button.`).footer().build();
      await channel1.send({ embeds: [embed], components: [buttonRow] })
      return channel1;
    } else if(ticketembedcheck){
      let [title, thumbnail, description] = [ticketembedcheck.title, ticketembedcheck.thumbnail, ticketembedcheck.description];
      try{
        if(title === null) title = "Ticket";
        if(thumbnail === null) thumbnail = `${process.env.thumbnail}`;
        if(description === null) description = "> Open Ticket By Clicking Below Button.";
        const embed = await ext.embedBuild().title(`${title}`).thumbnail(`${thumbnail}`).description(`${description}`).footer().build();
        await channel1.send({ embeds: [embed], components: [buttonRow] });
        return channel1;
      } catch (e){
        const embed = await ext.embedBuild().title(`${title}`).thumbnail(`${process.env.thumbnail}`).description(`${description}`).footer().build();
        await channel1.send({ embeds: [embed], components: [buttonRow] });
        return channel1;
      }
    }
  }
    
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

  embedBuild(){
    const client = this.client;
    const embed = new EmbedBuilder().setColor(`${ec}`);
    function title(title){
      embed.setTitle(title);
      return this;
    }
    function description(description){
      embed.setDescription(description);
      return this;
    }
    function color(clr){
      embed.setColor(clr);
      return this;
    }
    function author(text, iconurl){
      embed.setAuthor({ name: text, iconURL: iconurl });
      return this;
    }
    function thumbnail(url){
      embed.setThumbnail(url);
      return this;
    }
    function image(url){
      embed.setImage(url);
      return this;
    }
    function url(url){
      embed.setURL(url);
      return this;
    }
    function footer(text, iconurl){
      embed.setFooter({ text: text ? text : `${client.user.username} - ${process.env.year} ©` , iconURL: iconurl ? iconurl : process.env.iconurl });
      return this;
    }
    function fields(...fieldSets){
      const realFields = [];
      for (let i = 0; i < fieldSets.length; i += 3){
        const [name, value, inline] = fieldSets.slice(i, i + 3);
        realFields.push({ name, value, inline });
      }
      embed.addFields(...realFields);
      return this;
    }
    function ifields(...fieldSets){
      const realFields = [];
      for (let i = 0; i < fieldSets.length; i += 2){
        const [name, value] = fieldSets.slice(i, i + 2);
        realFields.push({ name, value, inline: true });
      }
      embed.addFields(...realFields);
      return this;
    }
    function bfields(...fieldSets){
      const realFields = [];
      for (let i = 0; i < fieldSets.length; i += 3){
        const [name, value, inline] = fieldSets.slice(i, i + 3);
        realFields.push({ name: `**${name}: **`, value, inline });
      }
      embed.addFields(...realFields);
      return this;
    }
    function vfields(...fieldSets){
      const realFields = [];
      for (let i = 0; i < fieldSets.length; i += 3){
        const [name, value, inline] = fieldSets.slice(i, i + 3);
        realFields.push({ name , value: `> ${value}`, inline });
      }
      embed.addFields(...realFields);
      return this;
    }
    function ibfields(...fieldSets){
      const realFields = [];
      for (let i = 0; i < fieldSets.length; i += 2){
        const [name, value] = fieldSets.slice(i, i + 2);
        realFields.push({ name: `**${name}: **`, value, inline: true });
      }
      embed.addFields(...realFields);
      return this;
    }
    function bvfields(...fieldSets){
      const realFields = [];
      for (let i = 0; i < fieldSets.length; i += 2){
        const [name, value] = fieldSets.slice(i, i + 2);
        realFields.push({ name: `**${name}: **`, value: `> ${value}`, inline });
      }
      embed.addFields(...realFields);
      return this;
    }
    function ivfields(...fieldSets){
      const realFields = [];
      for (let i = 0; i < fieldSets.length; i += 2){
        const [name, value] = fieldSets.slice(i, i + 2);
        realFields.push({ name , value: `> ${value}`, inline: true });
      }
      embed.addFields(...realFields);
      return this;
    }
    function ibvfields(...fieldSets){
      const realFields = [];
      for (let i = 0; i < fieldSets.length; i += 2){
        const [name, value] = fieldSets.slice(i, i + 2);
        realFields.push({ name: `**${name}: **`, value: `> ${value}`, inline: true });
      }
      embed.addFields(...realFields);
      return this;
    }
    function build(){
      return embed;
    }
    return { author, title, description, thumbnail, image, url, fields, ifields, bfields, ibfields, vfields, bvfields, ivfields, ibvfields, color, footer, build };
  }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

  buttons(...values){
    const buttonRow = new ActionRowBuilder();
    for(let i = 0; i < values.length; i += 3){
      const [label, customId, style] = values.slice(i, i + 3);
      if(customId.includes(`url`)){
        const button = new ButtonBuilder()
          .setLabel(`${label.replace(/\(disabled\)/g, '')}`)
          .setURL(`${customId.replace(/\(url\)/g, '')}`)
          .setDisabled(label.includes(`disabled`) ? true : false)
          .setStyle(style);
        buttonRow.addComponents(button);
      } else {
        const button = new ButtonBuilder()
          .setLabel(`${label.replace(/\(disabled\)/g, '')}`)
          .setCustomId(`${customId}`)
          .setDisabled(label.includes(`disabled`) ? true : false)
          .setStyle(style);
        buttonRow.addComponents(button);
      }
    }
    return buttonRow;
  }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

  isValidImgUrl(url){
    var imageExtensions = /\.(jpg|jpeg|png|gif)$/i;
    if (url.match(imageExtensions)) {
      return true;
    } else {
      return false;
    }
  }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

}