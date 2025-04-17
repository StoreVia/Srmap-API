const Command = require('../../structures/Commands/CommandClass');
const { SlashCommandBuilder, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputStyle, TextInputBuilder, MessageFlags } = require('discord.js');

module.exports = class AttendanceCommand extends Command {
    constructor(client) {
        super(client, {
            data: new SlashCommandBuilder()
                .setName('attendance')
                .setDescription('Check your attendance.')
                .addStringOption(option =>
                    option.setName('subject')
                        .setDescription('Select A Subject')
                        .setRequired(true)
                        .setAutocomplete(true)
                ),
            usage: '/attendance {subject}',
            category: 'info',
            permissions: ['Send Messages'],
        });
    }

    async autocomplete(client, interaction) {
        const userId = interaction.user.id;
        const credentials = await client.quickdb.get(`user_${userId}`);
        if (!credentials) {
            return interaction.respond([{ name: "Use /login Command To Use This Command.", value: "dbnotfound" }]);
        }
        const { un, pass } = credentials;
        const response = await fetch("https://srmapi.vercel.app/api?type=db", {
            headers: { Cookie: `un=${un}; pass=${pass}` }
        });
        const data = await response.json();
        if (!data.success) {
            return interaction.respond([{ name: `${data.message}`, value: "error" }]);
        }
        const subjects = data.data.attendance.map(subj => subj.subject_name);
        const focusedValue = interaction.options.getFocused().toLowerCase();
        const filtered = subjects.filter(name => name.toLowerCase().includes(focusedValue)).slice(0, 25);
        const responseList = filtered.map(name => ({ name, value: name }));
        return interaction.respond(responseList);
    }

    async run(client, interaction) {
        await interaction.deferReply();
        const userId = interaction.user.id;
        const credentials = await client.quickdb.get(`user_${userId}`);
        if (!credentials) {
            return interaction.followUp({ content: `❌ Use "/login" Command To Use This Command.` });
        }
        const { un, pass } = credentials;
        const subjectName = interaction.options.getString('subject');
        if (subjectName === "dbnotfound") {
            return interaction.followUp({ content: `❌ Invalid Credentials Pls Login Again By Using "/login" Command.` });
        }
        let response = await fetch(`https://srmapi.vercel.app/api?type=db`, {
            headers: { Cookie: `un=${un}; pass=${pass}` }
        });
        const data = await response.json();
        if (!data.success) {
            return interaction.followUp({ content: `❌ ${response.data.message}` });
        }
        let profileData = data.data.profile;
        let nameObj = profileData.find(item => item["Student Name"]);
        let name =  nameObj["Student Name"];
        let profilePic = profileData.find(item => item.picture)?.picture || "https://i.imgur.com/OOYXqPg.jpeg";
        if(name.includes("BRAHMENDRA")) name = "BRAHMENDRA";
        let subject = data.data.attendance.find(subj => subj.subject_name === subjectName);
        let classesConducted = subject.classes_conducted;
        let absents = subject.absent;
        let maxBunkable = Math.floor((0.25 * classesConducted - absents) / 0.75);
        maxBunkable = maxBunkable >= 0 ? maxBunkable : 0;
        let requiredAttendance = Math.ceil(absents / 0.25);
        let classesNeeded = requiredAttendance - classesConducted;
        classesNeeded = classesNeeded > 0 ? classesNeeded : 0;
        const buttonRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("wantedBunks")
                .setLabel("Wanted Bunks")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId("stinteraction")
                .setLabel("Stop")
                .setStyle(ButtonStyle.Danger)
        );
        let embed = new EmbedBuilder()
            .setTitle(`${subject.subject_name} (${subject.subject_code})`)
            .setAuthor({ name: `${name}`, url: `${process.env.vercel}`, iconURL: `${profilePic}` })
            .setDescription(`> Attendance:- **${subject.present_percentage}%**\n> Classes Conducted:- **${subject.classes_conducted}**\n> Present:- **${subject.present}**\n> Absent:- **${subject.absent}**`)
            .setThumbnail("https://i.imgur.com/26EZB7q.jpeg")
            .addFields(
                { name: 'ClassesCanBunk', value: `> ${maxBunkable}`, inline: true },
                { name: 'ClassesNeededFor(75%)', value: `> ${classesNeeded}`, inline: true },
            )
            .setColor("#3498db");
        const msg = await interaction.followUp({ embeds: [embed], components: [buttonRow] });
        const filter = i => i.customId;
        const collector = msg.createMessageComponentCollector({ filter, idle: 300000 });
        collector.on('collect', async i => {
			  if(i.user.id != userId){
				  await i.reply({ content: "This Interaction Doesn't Belongs To You.", flags: MessageFlags.Ephemeral });
			  } else if(i.customId === "wantedBunks"){
                const modal = new ModalBuilder()
                    .setCustomId(`bunkModal`)
                    .setTitle("Enter No.of Bunks")
                    .addComponents(
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId("bunkCount")
                                .setLabel("Enter No.of Classes You Wanted Bunk?")
                                .setStyle(TextInputStyle.Short)
                                .setRequired(true)
                        )
                    );
                await i.showModal(modal);
			  } else if(i.customId === "stinteraction"){
				  buttonRow.components.map(component=> component.setDisabled(true));
				  await i.update({ components: [buttonRow] });
			  }
		  })
    }
};