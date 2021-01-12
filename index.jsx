import { Plugin } from "@vizality/entities"
import { React, getModule, getModuleByDisplayName, contextMenu } from '@vizality/webpack';
import { patch, unpatch } from "@vizality/patcher"
import EmojiUtility from "./modules/EmojiUtility"
const { open: openModal, close: closeModal } = require('@vizality/modal')

import { Menu, Modal, Button } from '@vizality/components';
import EmojiContextMenuRender from './components/context-menus/EmojiUtilContextMenu'
import RenameModal from "./components/modals/Rename"
const TextInput = getModuleByDisplayName("TextInput")
const FormTitle = getModuleByDisplayName('FormTitle')
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
                    contextMenu.openContextMenu(e, () => <Menu.Menu onClose={contextMenu.closeContextMenu}>
                        {EmojiContextMenuRender(
                            selectedEmoji.url, // Image
                            selectedEmoji.name, // Name
                            selectedEmoji.id // ID
                        )}
                        {
                            EmojiUtility.canManageEmojis(selectedEmoji.guildId) ?
                            <>
                                <Menu.MenuItem
                                    id="eu-rename-emoji"
                                    label="Rename Emoji"
                                    action={() => {
                                        openModal(() => {
                                            return this.renderRenameModal("Rename emoji", (newval) => {
                                                EmojiUtility.renameEmoji(selectedEmoji.guildId, selectedEmoji.id, newval)
                                            }, selectedEmoji.name) 
                                        })
                                    }}
                                />

                                <Menu.MenuItem
                                    id="eu-delete-emoji"
                                    label="Delete Emoji"
                                    color="colorDanger"
                                    action={() => {
                                        console.log(selectedEmoji)
                                        EmojiUtility.deleteEmoji(selectedEmoji.guildId, selectedEmoji.id)
                                    }}
                                />
                            </>
                            :
                            <></>
                        }
                    </Menu.Menu>)
                }
            }

            return res;
        });
        // The true at the end of the function changes the patching to a pre-patching. To be honest idk what it means, but it works™
    }

    renderRenameModal(title, onAcceptChanges, placeholder = "", original = ""){
        let newVal = original
        return <>
            <Modal size={Modal.Sizes.SMALL}>
                <Modal.Header>
                    <FormTitle tag={FormTitle.Tags.H3}>{title}</FormTitle>
                </Modal.Header>
                <Modal.Content>
                    <TextInput
                        autoFocus
                        defaultValue={original}
                        className="qi-message-textbox"
                        placeholder={placeholder}
                        onChange={(value) => {
                            newVal = value
                        }}
                    />
                </Modal.Content>
                <Modal.Footer>
                    <Button
                        look={Button.Looks.FILLED}
                        size={Button.Sizes.MEDIUM}
                        color={Button.Colors.BRAND}
                        onClick={(e) => {
                            onAcceptChanges(newVal)
                            closeModal()
                        }}
                    >
                        Rename
                    </Button>
                    <Button
                        look={Button.Looks.LINK}
                        size={Button.Sizes.MEDIUM}
                        color={Button.Colors.WHITE}
                        onClick={(e) => {
                            closeModal()
                        }}
                    >
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    }
}