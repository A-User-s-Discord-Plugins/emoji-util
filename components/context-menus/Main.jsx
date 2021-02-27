//sorry for doing this, Menu only accepts MenuItem or MenuGroup
import fs from "fs"
import path from "path"
import { shell } from 'electron'
import { clipboard, nativeImage } from "electron"

import { React, getModule } from "@vizality/webpack"
import * as http from "@vizality/http"
import EmojiUtility from "../../modules/EmojiUtility"
import ImageUtil from "../../modules/ImageUtil";
const { open: openModal } = require('@vizality/modal')
const settings = vizality.api.settings._fluxProps(this.addonId)

import { ContextMenu } from '@vizality/components';
import PreviewEmoji from "../modals/preview"
import ServerList from "./serverList"
const { getFlattenedGuilds } = getModule("getFlattenedGuilds")



export default function (emojiUrl, emojiID, internalEmoji = false){
    let emojiName;
    if (!internalEmoji) try {
        emojiName = EmojiUtility.getEmojiByID(emojiID).name
    } catch (e) { console.error(e) }

    return <>
        <ContextMenu.Item
            id='eu-clone'
            disabled={internalEmoji}
            label='Clone Emoji'
        >
            {
                ServerList(
                    (guild) => {
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
                    }
                )
            }
        </ContextMenu.Item>

        <ContextMenu.Item
            id='eu-save'
            label='Save Emoji'
            action={async (e) => {
                let fileContents = await http.get(emojiUrl)

                if (settings.getSetting("saveFolderPath") === "" || settings.getSetting("saveFolderPath") === null || e.shiftKey){
                    DiscordNative.fileManager.saveWithDialog(fileContents.body, `${emojiName}.png`)

                } else if (fs.existsSync(settings.getSetting("saveFolderPath"))) {
                    let filePath = `${PathManager.getEmojiFolderPath()}/${emojiName}.png`
                    fs.promises.writeFile(filePath, fileContents.body).then(() => {
                        vizality.api.notices.sendToast('eu-download-sucessfully-toast', {
                            header: "Emoji downloaded",
                            content: "The emoji was downloaded sucessfully",
                            icon: 'EmojiPeopleCategory',
                            timeout: 8e3,
                            buttons: [{
                                text: 'Open',
                                color: 'brand',
                                size: 'medium',
                                look: 'outlined',
                                onClick: () => {
                                    vizality.api.notices.closeToast('eu-download-sucessfully-toast');
                                    shell.showItemInFolder(filePath)
                                }
                            }]
                        });
                    })

                } else {
                    vizality.api.notices.sendToast('eu-download-error-toast', {
                        header: "Error",
                        content: "The emoji folder doesn't exist. Maybe you deleted or renamed it? Anyway, you can check your settings",
                        icon: 'CloseCircle',
                        buttons: [{
                            text: 'Open Settings',
                            color: 'yellow',
                            size: 'medium',
                            look: 'outlined',
                            onClick: () => {
                                vizality.api.notices.closeToast('eu-download-error-toast');
                                vizality.api.router.navigate("/vizality/dashboard/plugins/emoji-util") }
                        }]
                    });
                }
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
                    console.log
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

        <ContextMenu.Item
            id='eu-extras'
            label='Extras'
        >
            <ContextMenu.Item
                id='eu-preview'
                label='Preview Emoji'
                action={async () => {
                    openModal(() => <PreviewEmoji emojiUrl={emojiUrl} />)
                }}
            />
            <ContextMenu.Item
                id='eu-search-image'
                label='Reverse Image Search Emoji'
                action={() => shell.openExternal(`https://www.google.com/searchbyimage?image_url=${emojiUrl}`)}
            />
            <ContextMenu.Item
                id='eu-open-external-browser'
                label='Open in external browser'
                action={() => shell.openExternal(emojiUrl)}
            />
        </ContextMenu.Item>
    </>
}