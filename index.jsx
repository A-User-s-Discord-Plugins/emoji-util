import { Plugin } from "@vizality/entities"
import { React, getModule, getModuleByDisplayName, contextMenu } from '@vizality/webpack';
import { patch, unpatch } from "@vizality/patcher"
import EmojiUtility from "./modules/EmojiUtility"
const { open: openModal, close: closeModal } = require('@vizality/modal')
const { updateSetting, getSetting, toggleSetting } = vizality.api.settings._fluxProps(this.addonId)

import { Menu, Modal, Button } from '@vizality/components';
import Settings from "./components/settings"
import EmojiContextMenuRender from './components/context-menus/EmojiUtilContextMenu'
import { fi } from "@vizality/src/core/languages";
const TextInput = getModuleByDisplayName("TextInput")
const FormTitle = getModuleByDisplayName('FormTitle')
const MessageContextMenu = getModule(m => m.default && m.default.displayName === 'MessageContextMenu')
const EmojiPickerListRow = getModule(m => m.default && m.default.displayName == "EmojiPickerListRow")
const NativeImageContextMenu = getModule(m => m.default?.displayName === 'NativeImageContextMenu');

export default class EmojiUtil extends Plugin{
    async onStart(){
        this.injectStyles('./styles/index.scss')

        this.injectContextMenuInMessageContextMenu()
        this.injectContextMenuInEmojiPicker()
        this.injectContextMenuInEmojiElement()
        
        vizality.api.settings.registerAddonSettings({
            id: this.addonId,
            heading: 'Emoji Util',
            render: Settings
        })
    }

    onStop(){
        unpatch("eu-emoji-message-context-menu")
        unpatch("eu-emoji-picker-context-menu")
        unpatch("eu-emoji-element-context-menu")
    }

    injectContextMenuInMessageContextMenu(){
        patch('eu-emoji-message-context-menu', MessageContextMenu, 'default', (args, res) => {
            console.log(args, res)
            let itemDOM = args[0].target

            if (itemDOM.classList.contains('emoji')){
                console.log(itemDOM)
                let emojiName = itemDOM.attributes[0].value.replace(":", "")
                let emojiID = itemDOM.src.split("/")[4].replace(".png?v=1", "")

                res.props.children.push(
                    <Menu.MenuSeparator />,
                    <>
                        {getSetting('subMenu', true) ?
                        <Menu.MenuItem
                            id='eu-emoji-submenu'
                            label='Emoji Util'
                        >
                            {EmojiContextMenuRender(
                                itemDOM.src, // Image: URL
                                emojiName, // Name: String
                                emojiID, // ID: String
                                itemDOM.src.includes(`/assets/`) // Internal emoji: Boolean (optional)
                            )}
                        </Menu.MenuItem>
                        :
                        EmojiContextMenuRender(
                            itemDOM.src, // Image: URL
                            emojiName, // Name: String
                            emojiID, // ID: String
                            itemDOM.src.includes(`/assets/`) // Internal emoji: Boolean (optional)
                        )}
                    </>
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
                    let selectedEmojiUrl;
                    if (!selectedEmoji.managed) { selectedEmojiUrl = selectedEmoji.url }
                    else { selectedEmojiUrl = `https://discord.com${selectedEmoji.url}` }

                    contextMenu.openContextMenu(e, () => <Menu.Menu onClose={contextMenu.closeContextMenu}>
                        {EmojiContextMenuRender(
                            selectedEmojiUrl, // Image: URL
                            selectedEmoji.name, // Name: String
                            selectedEmoji.id, // ID: String
                            selectedEmoji.managed // Internal emoji: Boolean (optional)
                        )}
                        {
                            EmojiUtility.canManageEmojis(selectedEmoji.guildId) ?
                            <>
                                <Menu.MenuSeparator />
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
    }

    injectContextMenuInEmojiElement() {
        patch('eu-emoji-element-context-menu', NativeImageContextMenu, 'default', (args, res) => {
            console.log(args, res)
            let itemDOM = args[0].target

            if (itemDOM.classList.contains('emoji')){
                let emojiName = itemDOM.attributes[0].value.replace(":", "")
                let emojiUrl = args[0].src
                let emojiID = emojiUrl.split("/")[4].replace(".png?v=1", "")

                res.props.children.push(
                    <Menu.MenuSeparator />,
                    <>
                        {getSetting('subMenu', true) ?
                            <Menu.MenuItem
                                id='eu-emoji-submenu'
                                label='Emoji Util'
                            >
                                {EmojiContextMenuRender(
                                    emojiUrl, // Image: URL
                                    emojiName, // Name: String
                                    emojiID, // ID: String
                                    itemDOM.src.includes(`/assets/`) // Internal emoji: Boolean (optional)
                                )}
                            </Menu.MenuItem>
                            :
                            EmojiContextMenuRender(
                                emojiUrl, // Image: URL
                                emojiName, // Name: String
                                emojiID, // ID: String
                                itemDOM.src.includes(`/assets/`) // Internal emoji: Boolean (optional)
                            )}
                    </>
                )
            }

            return res;
        });
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

Array.prototype.remove = function () { //why not?
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};