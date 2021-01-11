import { getModule, constants } from '@vizality/webpack';
import ImageUtil from "./ImageUtil"

const { uploadEmoji } = getModule('uploadEmoji')

export default {
    createEmojiFromUrl: async (guildId, emojiUrl, name) => {
        try {
            let emojiBase64 = await ImageUtil.linkToBase64(emojiUrl)
            await uploadEmoji(guildId, emojiBase64, name.replace(constants.EMOJI_RE, '').substr(0, constants.EMOJI_MAX_LENGTH))
        } catch (err) {
            if (name.length > constants.EMOJI_MAX_LENGTH) throw `Emoji name is bigger than ${constants.EMOJI_MAX_LENGTH} characters`
            else throw err
        }
    }
}