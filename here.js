const token = "TOKEN"
const prefix = "PREFIX"
const anti = JSON.parse(fs.readFileSync("./antigreff.json", { encoding: "utf8" }))
const config = JSON.parse(fs.readFileSync("./config.json", { encoding: "utf8" }))
const basicLimits = {
    banLimit: 3,
    chaDelLimit: 3,
    roleDelLimit: 3,
    kickLimits: 3,
    roleCrLimits: 3
}
function rewriteConfigs(config, anti) {
    try {
        fs.writeFileSync("./config.json", JSON.stringify(config, null, 2))
        fs.writeFileSync("./antigreff.json", JSON.stringify(anti, null, 2))
    } catch (e) { throw e }
    return 0
}

client.on("message", (message) => {
    if (!message.channel.type != "text") return

    let user = anti[message.guild.id + message.author.id]
    let num = message.content.split(" ").slice(2).join(" ")

    if (!user) {
        user = { actions: 0 }
    }

    if (!config[message.guild.id]) {
        config[message.guild.id] = basicLimits
        config[time] = 30
    }

    const args = message.content.split(/ /)
    const cmd = args.shift()

    if (cmd == `${prefix}settings` && args[0] == "limits") {
        if (!message.member.hasPermission("MANAGE_GUILD")) return

        if (args[1] == "ban") {
            if (!num) return message.channel.send("**⇏ | أرسل رقم ! **")
            if (isNaN(num)) return message.channel.send("**⇏ | أرقام فقط ! **")
            config[message.guild.id].banLimit = num
            message.channel.send(`**⇏ | تم التغيير اِلي : ${num} **`)

        } else if (args[1] == "kick") {
            if (!num) return message.channel.send("**⇏ | أرسل رقم ! **")
            if (isNaN(num)) return message.channel.send("**⇏ | أرقام فقط ! **")
            config[message.guild.id].kickLimits = num
            message.channel.send(`**⇏ | تم التغيير اِلي : ${num}**`)

        } else if (args[1] == "roleD") {
            if (!num) return message.channel.send("**⇏ | أرسل رقم ! **")
            if (isNaN(num)) return message.channel.send("**⇏ | أرقام فقط ! **")
            config[message.guild.id].roleDelLimit = num
            message.channel.send(`**⇏ | تم التغيير اِلي : ${num}**`)

        } else if (args[1] == "roleC") {
            if (!num) return message.channel.send("**⇏ | أرسل رقم ! **")
            if (isNaN(num)) return message.channel.send("**⇏ | أرقام فقط ! **")
            config[message.guild.id].roleCrLimits = num
            message.channel.send(`**⇏ | تم التغيير اِلي : ${num}**`)

        } else if (args[1] == "channelD") {
            if (!num) return message.channel.send("**⇏ | أرسل رقم ! **")
            if (isNaN(num)) return message.channel.send("**⇏ | أرقام فقط ! **")
            config[message.guild.id].chaDelLimit = num
            message.channel.send(`**⇏ | تم التغيير اِلي : ${num}**`)

        } else if (args[1] == "time") {
            if (!num) return message.channel.send("**⇏ | أرسل رقم ! **")
            if (isNaN(num)) return message.channel.send("**⇏ | أرقام فقط ! **")
            config[message.guild.id].time = num
            message.channel.send(`**⇏ | تم التغيير اِلي : ${num}**`)
        }

        try {
            fs.writeFileSync("./config.json", JSON.stringify(config, null, 2))
            fs.writeFileSync("./antigreff.json", JSON.stringify(anti, null, 2))
        } catch (e) { throw e }
    }
})

client.on("channelDelete", async (channel) => {
    const entry = await channel.guild.fetchAuditLogs({ type: 'CHANNEL_DELETE' }).entries.first().executor
    if (!config[channel.guild.id]) {

        config[channel.guild.id] = basicLimits
    }

    let user = anti[channel.guild.id + entry.id]
    if (!user) {
        user = { actions: 1 }

        setTimeout(() => {
            user.actions = 0
        }, config[channel.guild.id].time * 1000)

    } else {
        user = Math.floor(user.actions + 1)
        setTimeout(() => {
            user = 0

        }, config[channel.guild.id].time * 1000)

        if (user.actions >= config[channel.guild.id].chaDelLimit) {
            channel.guild.members.get(entry.id).ban().catch((_) => channel.guild.owner.send(`**⇏ | ${entry.username} قام بمسح الكثير من الرومات **`))
            user.actions = 0
        }
    }

    rewriteConfigs(config, anti)
})

client.on("roleDelete", async (role) => {
    const entry = await role.guild.fetchAuditLogs({ type: 'ROLE_DELETE' }).entries.first().executor

    if (!config[role.guild.id]) config[role.guild.id] = basicLimits

    let user = anti[role.guild.id + entry.id]
    if (!user) {
        user = { actions: 1 }
        setTimeout(() => {
            user.actions = 0
        }, config[role.guild.id].time * 1000)

    } else {
        user.actions = Math.floor(user.actions + 1)

        setTimeout(() => {
            user.actions = 0
        }, config[role.guild.id].time * 1000)

        if (user.actions >= config[role.guild.id].roleDelLimit) {
            channel.guild.members.get(entry.id).ban().catch((_) => role.guild.owner.send(`**⇏ | ${entry.username} قام بمسح الكثير من الرتب **`))
            user.actions = 0
        }
    }
    rewriteConfigs(config, anti)
})

client.on("roleCreate", async (role) => {
    const entry = await role.guild.fetchAuditLogs({
        type: 'ROLE_CREATE'
    }).entries.first().executor
    if (!config[role.guild.id]) {
        config[role.guild.id] = basicLimits
    }
    let user = anti[role.guild.id + entry.id]
    if (!user) {
        user = {
            actions: 1
        }
        setTimeout(() => {
            user.actions = 0
        }, config[role.guild.id].time * 1000)
    } else {
        user.actions = Math.floor(user.actions + 1)

        setTimeout(() => {
            user.actions = 0
        }, config[role.guild.id].time * 1000)

        if (user.actions >= config[role.guild.id].roleCrLimits) {
            role.guild.members.get(entry.id).ban().catch((_) => role.guild.owner.send(`**⇏ | ${entry.username} قام بأنشاء الكثير من الرتب **`))
            user.actions = 0
        }
    }

    rewriteConfigs(config, anti)
})

client.on("guildBanAdd", async (guild, _) => {
    const entry = await channel.guild.fetchAuditLogs({ type: 'MEMBER_BAN_ADD' }).entries.first().executor

    if (!config[guild.id]) {
        config[guild.id] = basicLimits
    }
    let user = anti[guild.id + entry.id]
    if (!user) {
        user = { actions: 1 }
        setTimeout(() => {
            user.actions = 0
        }, config[guild.id].time * 1000)
    } else {
        user.actions = Math.floor(user.actions + 1)

        setTimeout(() => {
            user.actions = 0
        }, config[guild.id].time * 1000)

        if (user.actions >= config[guild.id].banLimit) {
            guild.members.get(entry.id).ban().catch((e) => guild.owner.send(`**⇏ | ${entry.username} حاول حظر جميع الأعضاء **`))
            user.actions = 0
        }
    }

    rewriteConfigs(config, anti)
})

client.on("guildKickAdd", async (guild, _) => {
    const entry = await channel.fetchAuditLogs({ type: 'MEMBER_KICK' }).entries.first().executor
    if (!config[guild.id]) {
        config[guild.id] = basicLimits
    }

    let user = anti[guild.id + entry.id]

    if (!user) {
        user = { actions: 1 }
        setTimeout(() => {
            user.actions = 0
        }, config[guild.id].time * 1000)
    } else {
        user.actions = Math.floor(user.actions + 1)

        setTimeout(() => {
            user.actions = 0
        }, config[guild.id].time * 1000)

        if (user.actions >= config[guild.id].banLimit) {
            channel.members.get(entry.id).ban().catch((e) => guild.owner.send(`**⇏ | ${entry.username} حاول حظر جميع الأعضاء **`))
            user.actions = 0
        }
    }

    rewriteConfigs(config, anti)
})

client.on("guildMemberRemove", async (member) => {
    const action = await member.guild.fetchAuditLogs().entries.first().action
    if (action === "MEMBER_KICK") {
        const entry = await member.guild.fetchAuditLogs({ type: "MEMBER_KICK" }).entries.first().executor
        if (!config[member.guild.id]) {
            config[guild.id] = basicLimits
        }
        let user = anti[member.guild.id + entry.id]
        if (!user) {
            user = { actions: 1 }
            setTimeout(() => {
                user.actions = 0
            }, config[member.guild.id].time * 1000)

        } else {
            user.actions = Math.floor(user.actions + 1)

            setTimeout(() => {
                user.actions = 0
            }, config[member.guild.id].time * 1000)

            if (user.actions >= config[member.guild.id].kickLimits) {
                member.members.get(entry.id).ban().catch((e) => member.owner.send(`**⇏ | ${entry.username} حاول حظر جميع الأعضاء **`))
                user.actions = 0

            }
        }

        rewriteConfigs(config, anti)
    }

})

client.login(token)
