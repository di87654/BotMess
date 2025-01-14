module.exports.config = {
    name: "setprefix",
    version: "1.0.1",
    hasPermssion: 1,
    credits: "Mirai Team",
    description: "Đặt lại prefix của nhóm",
    commandCategory: "Box chat",
    usages: "[prefix/reset]",
    cooldowns: 0,
    images: [],
};

function getCurrentTime() {
    const now = new Date();
    const localTime = now.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
    return localTime;
}

module.exports.handleEvent = async function ({ api, event }) {
    const { threadID, body } = event;
    const { PREFIX } = global.config;
    const currentTime = getCurrentTime();

    let threadSetting = global.data.threadData.get(threadID) || {};
    let prefix = threadSetting.PREFIX || PREFIX;

    const triggerWords = ["prefix", "prefix bot là gì", "quên prefix r", "dùng sao"];
    if (triggerWords.includes(body.toLowerCase())) {
        const msg = `\n✏️ Prefix nhóm: ${prefix}\n 📎 Prefix hệ thống: ${global.config.PREFIX}\n` +
                    ` 📝 Tổng lệnh: ${client.commands.size}\n 👥 Người dùng bot: ${global.data.allUserID.length}\n` +
                    ` 🏘️ Tổng nhóm: ${global.data.allThreadID.length}\n` +
                    `────────────────────\n ⏰ Time: ${currentTime}`;
        api.sendMessage({ body: msg, attachment: global.vdgai.splice(0, 1) }, threadID, (err, info) => setTimeout(() => api.unsendMessage(info.messageID), 10000));
    }
};

module.exports.handleReaction = async function ({ api, event, Threads, handleReaction }) {
    if (event.userID != handleReaction.author) return;

    try {
        const { threadID, messageID } = event;
        let data = (await Threads.getData(threadID)).data || {};
        data.PREFIX = handleReaction.PREFIX;

        await Threads.setData(threadID, { data });
        global.data.threadData.set(threadID, data);

        api.unsendMessage(handleReaction.messageID);
        api.changeNickname(` ${handleReaction.PREFIX} ┊ ${global.config.BOTNAME}`, threadID, event.senderID);
        api.sendMessage(`☑️ Prefix nhóm đã đổi thành: ${handleReaction.PREFIX}`, threadID, messageID);
    } catch (e) {
        console.error(e);
    }
};

module.exports.run = async ({ api, event, args, Threads }) => {
    if (!args[0]) return api.sendMessage(`⚠️ Vui lòng nhập prefix mới`, event.threadID, event.messageID);

    const prefix = args[0].trim();
    if (!prefix) return api.sendMessage(`⚠️ Vui lòng nhập prefix hợp lệ`, event.threadID, event.messageID);

    if (prefix === "reset") {
        let data = (await Threads.getData(event.threadID)).data || {};
        data.PREFIX = global.config.PREFIX;

        await Threads.setData(event.threadID, { data });
        global.data.threadData.set(event.threadID, data);

        const uid = api.getCurrentUserID();
        api.changeNickname(` ${global.config.PREFIX} | ${global.config.BOTNAME}`, event.threadID, uid);
        api.sendMessage(`☑️ Prefix đã reset về mặc định: ${global.config.PREFIX}`, event.threadID, event.messageID);
    } else {
        api.sendMessage(`📝 Bạn yêu cầu set prefix mới: ${prefix}\n👉 Reaction tin nhắn này để xác nhận`, event.threadID, (err, info) => {
            global.client.handleReaction.push({
                name: "setprefix",
                messageID: info.messageID,
                author: event.senderID,
                PREFIX: prefix
            });
            setTimeout(() => api.unsendMessage(info.messageID), 10000);
        });
    }
};