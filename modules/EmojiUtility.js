import { getModule, constants } from '@vizality/webpack';
import ImageUtil from "./ImageUtil"

const discordEmojiUtil = getModule('uploadEmoji')
const { getGuilds } = getModule("getGuildEmoji")
const { getGuildPermissions } = getModule("getGuildPermissions")

export default {
    createEmojiFromUrl: async (guildId, emojiUrl, name) => {
        try {
            let emojiBase64 = await ImageUtil.linkToBase64(emojiUrl)
            await discordEmojiUtil.uploadEmoji(guildId, emojiBase64, name)
        } catch (err) {
            throw err
        }
    },
    renameEmoji: async (guildId, emojiID, newName) => {
        try {
            await discordEmojiUtil.updateEmoji(guildId, emojiID, newName)
        } catch (err) {
            throw err
        }
    },
    deleteEmoji: async (guildId, emojiID) => {
        try {
            await discordEmojiUtil.deleteEmoji(guildId, emojiID)
        } catch (err) {
            throw err
        }
    },
    canManageEmojis: (guildId) => {
        try {
            let guildperms = getGuildPermissions(guildId)
            if (guildperms && (guildperms & constants.Permissions.MANAGE_EMOJIS) !== 0) {
                return true
            } else {
                return false
            }
        } catch (err) {
            throw err
        }
    },
    getEmojiByID: (id) => {
        return Object.values(getGuilds()).flatMap(g => g.emojis).find(emoji => emoji.id === id)
    }
}