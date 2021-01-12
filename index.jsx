import { Plugin } from "@vizality/entities"
import { React, getModule, constants, contextMenu } from '@vizality/webpack';
import { patch, unpatch } from "@vizality/patcher"
import EmojiUtility from "./modules/EmojiUtility"

import { Menu } from '@vizality/components';
import EmojiContextMenuRender from './components/EmojiUtilContextMenu'
const MessageContextMenu = getModule(m => m.default && m.default.displayName === 'MessageContextMenu')
const EmojiPickerListRow = getModule(m => m.default && m.default.displayName == "EmojiPickerListRow")

export default class EmojiUtil extends Plugin{
    async onStart(){
        this.injectStyles('./styles/index.scss')
        this.injectContextMenuInMessageContextMenu()
        this.injectContextMenuInEmojiPicker()
    }

    onStop(){
        unpatch("eu-emoji-message-context-menu")
        unpatch("eu-emoji-picker-context-menu")
    }

    injectContextMenuInMessageContextMenu(){
        patch('eu-emoji-message-context-menu', MessageContextMenu, 'default', (args, res) => {
            console.log(args, res)
            let itemDOM = args[0].target

            if (itemDOM.classList.contains('emoji')){
                let emojiName = itemDOM.attributes[0].value.replace(":", "")
                let emojiID = itemDOM.src.split("/")[4].replace(".png?v=1", "")

                res.props.children.push(
                    <Menu.MenuSeparator />,
                    <Menu.MenuItem
                        id='eu-emoji-submenu'
                        label='Emoji'
                    >
                        {EmojiContextMenuRender(
                            itemDOM.src, // URL
                            emojiName, // Name
                            emojiID // ID
                        )}
                    </Menu.MenuItem>
                )
            }

            return res;
        });
    }

    injectContextMenuInEmojiPicker() {
        patch('eu-emoji-picker-context-menu', EmojiPickerListRow, 'default', (args, res) => {

            //Thanks Strencher
            if (!Array.isArray(res?.props?.children)) return res;

            for (const emoji of res.props.children) {
                if (!emoji || !emoji?.props?.children) continue;

                let selectedEmoji = emoji.props.children.props.emoji
                emoji.props.onContextMenu = e => {
                    console.log(emoji, "heya im here")
                    contextMenu.openContextMenu(e, () => <Menu.Menu onClose={contextMenu.closeContextMenu}>
                        {EmojiContextMenuRender(
                            selectedEmoji.url, // Image
                            selectedEmoji.name, // Name
                            selectedEmoji.id // ID
                        )}
                        <Menu.MenuItem 
                            id="eu-delete-emoji"
                            label="Delete emoji"
                            color="colorDanger"
                            action={() => {
                                console.log(selectedEmoji)
                                EmojiUtility.deleteEmoji(selectedEmoji.guildId, selectedEmoji.id)
                            }}
                        />
                    </Menu.Menu>)
                }
            }

            return res;
        });
        // The true at the end of the function changes the patching to a pre-patching. To be honest idk what it means, but it works™
    }
}