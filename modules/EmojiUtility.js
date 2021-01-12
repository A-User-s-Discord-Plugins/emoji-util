import { getModule, constants } from '@vizality/webpack';
import ImageUtil from "./ImageUtil"

const discordEmojiUtil = getModule('uploadEmoji')

export default {
    createEmojiFromUrl: async (guildId, emojiUrl, name) => {
        try {
            let emojiBase64 = await ImageUtil.linkToBase64(emojiUrl)
            await discordEmojiUtil.uploadEmoji(guildId, emojiBase64, name.replace(constants.EMOJI_RE, '').substr(0, constants.EMOJI_MAX_LENGTH))
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
    }
}