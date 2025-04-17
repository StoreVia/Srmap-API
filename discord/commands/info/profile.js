const Command = require('../../structures/Commands/CommandClass');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = class ProfileCommand extends Command {
    constructor(client) {
        super(client, {
            data: new SlashCommandBuilder()
                .setName('profile')
                .setDescription('Check Your Profile Details.'),
            usage: '/profile',
            category: 'info',
            permissions: ['Send Messages'],
        });
    }

    async run(client, interaction) {
        await interaction.deferReply();
        const userId = interaction.user.id;
        const credentials = await client.quickdb.get(`user_${userId}`);
        if (!credentials) {
            return interaction.followUp({ content: "❌ Use /login Command To Use This Command." });
        }
        const { un, pass } = credentials;
        const response = await fetch("https://srmapi.vercel.app/api?type=db", {
            headers: { Cookie: `un=${un}; pass=${pass}` }
        });
        const data = await response.json();
        if (!data.success) {
            return interaction.followUp({ content: `❌ ${data.message}` });
        }
        let profileData = data.data.profile;
        let name = profileData.find(item => item["Student Name"])["Student Name"];
        let registerNo = profileData.find(item => item["Register No."])["Register No."];
        let institution = profileData.find(item => item["Institution"])["Institution"];
        let semester = profileData.find(item => item["Semester"])["Semester"];
        let programSection = profileData.find(item => item["Program / Section"])["Program / Section"];
        let [program, section] = programSection.split(" / ").map(s => s.trim().replace(/['\u00a0]/g, ""));
        let specialization = profileData.find(item => item["Specialization"])?.["Specialization"] || "Nothing";
        let dobGender = profileData.find(item => item["D.O.B. / Gender"])["D.O.B. / Gender"].split(" / ");
        let dob = dobGender[0];
        let gender = dobGender[1];
        let profilePic = profileData.find(item => item.picture)?.picture || "https://i.imgur.com/OOYXqPg.jpeg";
        if (name.includes("BRAHMENDRA")) name = "BRAHMENDRA";
        let embed = new EmbedBuilder()
            .setAuthor({ name: `${name}`, iconURL: `${profilePic}`, url: `${process.env.vercel}` })
            .setDescription(`> **Institution:** ${institution}\n> **Program:** ${program}\n> **Specialization:** ${specialization}`)
            .setThumbnail(`https://i.imgur.com/26EZB7q.jpeg`)
            .addFields(
                { name: 'Register Number', value: `> ${registerNo}`, inline: true },
                { name: 'Semester', value: `> ${semester}`, inline: true },
                { name: 'Section', value: `> ${section}`, inline: true },
                { name: 'Date of Birth', value: `> ${dob}`, inline: true },
                { name: 'Gender', value: `> ${gender}`, inline: true }
            )
            .setColor("#3498db");

        return interaction.followUp({ embeds: [embed] });
    }
};