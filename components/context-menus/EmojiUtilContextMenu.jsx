//sorry for doing this, Menu only accepts MenuItem or MenuGroup
import { clipboard } from "electron"
import { React, getModule, constants } from "@vizality/webpack"
import { ContextMenu } from '@vizality/components';
import { nativeImage } from 'electron'
import * as http from "@vizality/http"
import EmojiUtility from "../../modules/EmojiUtility"
import ImageUtil from "../../modules/ImageUtil";

const { getFlattenedGuilds } = getModule("getFlattenedGuilds")

export default function (emojiUrl, emojiName, emojiID, internalEmoji = false){
    let guildsWithPerm = listGuildsWithManageEmojiPermission()

    return <>
        <ContextMenu.Item
            id='eu-clone'
            disabled={internalEmoji}
            label='Clone Emoji'
        >
            {
                guildsWithPerm.map((guild) => {
                    return <ContextMenu.Item
                        id={`eu-clone-guild-${guild.id}`}
                        label={[
                            <>
                                {
                                    typeof guild.icon === "string" ? 
                                    <img src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp`}
                                        className="eu-rounded-guild-image"
                                    />
                                    :
                                    <></>
                                }
                            </>
                            ,
                            guild.name
                        ]}
                        action={() => {
                            EmojiUtility.createEmojiFromUrl(guild.id, emojiUrl, emojiName).then(() => {
                                vizality.api.notices.sendToast('eu-cloned-sucessfully-toast', {
                                    header: "Cloned",
                                    content: "The emoji was cloned sucessfully",
                                    icon: 'FileUpload',
                                    timeout: 5e3,
                                });
                            }).catch(err => {
                                console.error(err)
                            })
                        }}
                    />
                })
            }
        </ContextMenu.Item>

        <ContextMenu.Item
            id='eu-save'
            label='Save Emoji'
            action={async () => {
                let fileContents = await http.get(emojiUrl)
                DiscordNative.fileManager.saveWithDialog(fileContents.body, `${emojiName}.png`)
            }}
        />

        <ContextMenu.Item
            id='eu-copy'
            label='Copy Emoji'
        >
            <ContextMenu.Item
                id='eu-copy-url'
                label='URL'
                action={() => {
                    clipboard.writeText(emojiUrl)
                }}
            />
            <ContextMenu.Item
                id='eu-copy-image'
                label='Image'
                disabled={internalEmoji}
                action={async () => {
                    let buffer = await ImageUtil.linkToBuffer(emojiUrl)
                    let image = nativeImage.createFromBuffer(buffer)
                    clipboard.writeImage(image)
                }}
            />
            <ContextMenu.Item
                id='eu-copy-name'
                label='Name'
                action={() => {
                    clipboard.writeText(emojiName)
                }}
            />
            <ContextMenu.Item
                id='eu-copy-id'
                label='ID'
                disabled={internalEmoji}
                action={() => {
                    clipboard.writeText(emojiID)
                }}
            />
        </ContextMenu.Item>
    </>
}

const listGuildsWithManageEmojiPermission = function() {
    let guildList = getFlattenedGuilds();
    let guildsWithPerm = [];
    guildList.map((guild) => {
        if (EmojiUtility.canManageEmojis(guild.id)) {
            guildsWithPerm.push(guild)
        }
    })
    return guildsWithPerm
}