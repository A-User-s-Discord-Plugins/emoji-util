import { Plugin } from "@vizality/entities"
import { React, getModule, constants, contextMenu } from '@vizality/webpack';
import { patch, unpatch } from "@vizality/patcher"
import EmojiUtility from "./modules/EmojiUtility"
import ImageUtil from "./modules/ImageUtil"

import { Menu } from '@vizality/components';
import EmojiContextMenuRender from './components/EmojiUtilContextMenu'
const emojiStore = getModule('getGuildEmoji')
const MessageContextMenu = getModule(m => m.default && m.default.displayName === 'MessageContextMenu')
const ExpressionPickerListItemImage = getModule(m => m.default && m.default.displayName === 'ExpressionPickerListItemImage')

export default class EmojiUtil extends Plugin{
    async onStart(){
        this.injectStyles('./styles/index.scss')
        this.injectContextMenuInMessageContextMenu()
        this.injectContextMenuInEmojiPicker()
    }

    onStop(){
        unpatch("eu-emoji-message-context-menu")
        unpatch("eu-emoji-emoji-picker-context-menu")
    }

    injectContextMenuInMessageContextMenu(){
        patch('eu-emoji-message-context-menu', MessageContextMenu, 'default', (args, res) => {
            console.log(args, res)
            let itemDOM = args[0].target

            if (args[0].target.classList.contains('emoji')){
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
        console.log(ExpressionPickerListItemImage)
        patch('eu-emoji-emoji-picker-context-menu', ExpressionPickerListItemImage, 'default', (args) => {
            console.log(args)

            args[0].onContextMenu = (e) => {
                console.log(args, "heya im here")
                let guildsWithPerm = this.listServersWithManageEmojiPermission()
                contextMenu.openContextMenu(e, () => <Menu.Menu onClose={contextMenu.closeContextMenu}>
                    {EmojiContextMenuRender(
                        args[0].src, // Image
                        args[0].alt.replace(":", ""), // Name
                        Object.values(emojiStore.getGuilds()).flatMap(g => g.emojis).find(e => e.src === args[0].src) // ID. sorry for this
                    )}
                </Menu.Menu>)
            }

            return args;
        }, true);
        // The true at the end of the function changes the patching to a pre-patching. To be honest idk what it means, but it works™
    }
}