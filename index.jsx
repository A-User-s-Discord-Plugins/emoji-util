import { Plugin } from "@vizality/entities"
import { React, getModule } from '@vizality/webpack';
import { patch, unpatch } from "@vizality/patcher"
import EmojiUtility from "./modules/EmojiUtility"
import ImageUtil from "./modules/ImageUtil"

import { Menu, LazyImage } from '@vizality/components';

const MessageContextMenu = getModule(m => m.default && m.default.displayName === 'MessageContextMenu')

export default class EmojiUtil extends Plugin{
    async onStart(){
        this.injectContextMenu()
    }

    onStop(){
        unpatch("eu-emoji-context-menu")
    }

    async injectContextMenu(){
        patch('eu-emoji-context-menu', MessageContextMenu, 'default', (args, res) => {
            console.log(args, res)
            if (args[0].target.classList.contains('emoji')){
                let emojiDOM = args[0].target
                let emojiUrl = emojiDOM.src
                let emojiName = emojiDOM.attributes[0].value.replace(":", "")
                res.props.children.push(
                    <Menu.MenuSeparator />,
                    <Menu.MenuItem
                        id='eu-emoji-submenu'
                        label='Emoji'
                    >
                        <Menu.MenuItem 
                            id='eu-cloneto'
                            label='Clone to'
                            action={() => {
                                EmojiUtility.createEmojiFromUrl("539180316447997972", emojiUrl, emojiName).then(() => {
                                    this.log("emoji uploaded hvae fun")
                                }).catch(err => {
                                    this.error(err)
                                })
                            }}
                        />
                    </Menu.MenuItem>
                )
            }
            return res;
        });
    }
}