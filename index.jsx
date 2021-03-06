import { Plugin } from "@vizality/entities"
import { findInReactTree } from '@vizality/util/react'
import { React, getModule, getModuleByDisplayName, contextMenu } from '@vizality/webpack';
import { patch, unpatch } from "@vizality/patcher"
import EmojiUtility from "./modules/EmojiUtility"
const { open: openModal, close: closeModal } = require('@vizality/modal')

const { updateSetting, getSetting, toggleSetting } = vizality.api.settings._fluxProps(this.addonId)

import { ContextMenu, Modal, Button } from '@vizality/components';
import Settings from "./components/settings"
import EmojiContextMenuRender from './components/context-menus/Main'
import EmojiContextServerList from './components/context-menus/serverList'
const TextInput = getModuleByDisplayName("TextInput")
const FormTitle = getModuleByDisplayName('FormTitle')
const MessageContextMenu = getModule(m => m.default?.displayName === 'MessageContextMenu')
const EmojiPickerListRow = getModule(m => m.default?.displayName === "EmojiPickerListRow")
const NativeImageContextMenu = getModule(m => m.default?.displayName === 'NativeImageContextMenu');
const Emoji = getModule('Emoji')
const UploadModal = getModuleByDisplayName('Upload')
const ChannelTextAreaContainer = getModule(m => m.type?.render?.displayName === "ChannelTextAreaContainer");

export default class EmojiUtil extends Plugin{
    async start(){
        this.injectStyles('./styles/index.scss')
        this.injectStyles('./styles/utils.scss')

        if (getSetting('colorDisabledEmojis', false)) {
            document.documentElement.setAttribute('eu-colorDisabledEmojis', '')
        }

        this.injectContextMenuInMessageContextMenu()
        this.injectContextMenuInEmojiPicker()
        this.injectContextMenuInEmojiElement()
        // this.injectEmoji()
        // this.injectEmojiButton()
        
        this.registerSettings(Settings)
    }

    stop(){
        unpatch("eu-emoji-message-context-menu")
        unpatch("eu-emoji-picker-context-menu")
        unpatch("eu-emoji-element-context-menu")
        unpatch("eu-emoji-button-context-menu")
        // unpatch("eu-emoji-element")
    }

    injectContextMenuInMessageContextMenu(){
        patch('eu-emoji-message-context-menu', MessageContextMenu, 'default', (args, res) => {
            let itemDOM = args[0].target

            if (itemDOM.nodeName === "IMG"){
                if (itemDOM.classList.contains('emoji')) {
                    let emojiID = itemDOM.src.match(/https:\/\/cdn.discordapp.com\/emojis\/(\d+)/)[1]
                    let emojiName = itemDOM.alt.substring(1, itemDOM.alt.length - 1)
                    res.props.children.push(
                        <ContextMenu.Separator />,
                        <>
                            {getSetting('subMenu', true) ?
                                <ContextMenu.Item
                                    id='eu-emoji-submenu'
                                    label='Emoji Util'
                                >
                                    {EmojiContextMenuRender(
                                        itemDOM.src, // Image: URL
                                        emojiID, // ID: String
                                        itemDOM.src.includes(`/assets/`), // Internal emoji: Boolean (optional)
                                        emojiName
                                    )}
                                </ContextMenu.Item>
                                :
                                EmojiContextMenuRender(
                                    itemDOM.src, // Image: URL
                                    emojiID, // ID: String
                                    itemDOM.src.includes(`/assets/`), // Internal emoji: Boolean (optional)
                                    emojiName
                                )}
                        </>
                    )
                } else {
                    res.props.children.push(
                        <ContextMenu.Separator />,
                        <ContextMenu.Item
                            id='eu-create-emoji-submenu'
                            label='Create emoji'
                        >
                            {
                                EmojiContextServerList(
                                    (guild) => openModal(() => {
                                        return this.renderRenameModal("Create emoji", "Create", (name) => {
                                            EmojiUtility.createEmojiFromUrl(guild.id, itemDOM.src, name).then(() => {
                                                vizality.api.notices.sendToast('eu-created-sucessfully-toast', {
                                                    header: "Emoji Created",
                                                    content: "The emoji was created sucessfully",
                                                    icon: 'FileUpload',
                                                    timeout: 5e3,
                                                });
                                            }).catch(err => {
                                                console.error(err)
                                            })
                                        }, "my-awesome-emoji")
                                    })
                                )
                            }
                        </ContextMenu.Item>
                    )
                }
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

                    contextMenu.openContextMenu(e, () => <ContextMenu.Menu onClose={contextMenu.closeContextMenu}>
                        {EmojiContextMenuRender(
                            selectedEmojiUrl, // Image: URL
                            selectedEmoji.id, // ID: String
                            selectedEmoji.managed // Internal emoji: Boolean (optional)
                        )}
                        {
                            EmojiUtility.canManageEmojis(selectedEmoji.guildId) ?
                            <>
                                <ContextMenu.Separator />
                                <ContextMenu.Item
                                    id="eu-rename-emoji"
                                    label="Rename Emoji"
                                    action={() => {
                                        openModal(() => {
                                            return this.renderRenameModal("Rename emoji", "Rename", (newval) => {
                                                EmojiUtility.renameEmoji(selectedEmoji.guildId, selectedEmoji.id, newval)
                                            }, selectedEmoji.name) 
                                        })
                                    }}
                                />

                                <ContextMenu.Item
                                    id="eu-delete-emoji"
                                    label="Delete Emoji"
                                    color="colorDanger"
                                    action={() => {
                                        EmojiUtility.deleteEmoji(selectedEmoji.guildId, selectedEmoji.id)
                                    }}
                                />
                            </>
                            :
                            <></>
                        }
                    </ContextMenu.Menu>
                    )
                }


                if (getSetting('fileEmojis', false)) { // Upcoming feature
                    res.props.onClick = () => {
                        openModal(() => {
                            return <UploadModal />
                        })
                    }
                }
            }

            return res;
        });
    }

    injectContextMenuInEmojiElement() {
        patch('eu-emoji-element-context-menu', NativeImageContextMenu, 'default', (args, res) => {
            let itemDOM = args[0].target

            if (itemDOM.classList.contains('emoji')){
                let emojiUrl = args[0].src
                let emojiID = emojiUrl.split("/")[4].replace(".png?v=1", "")

                res.props.children.push(
                    <ContextMenu.Separator />,
                    <>
                        {getSetting('subMenu', true) ?
                            <ContextMenu.Item
                                id='eu-emoji-submenu'
                                label='Emoji Util'
                            >
                                {EmojiContextMenuRender(
                                    emojiUrl, // Image: URL
                                    emojiID, // ID: String
                                    itemDOM.src.includes(`/assets/`) // Internal emoji: Boolean (optional)
                                )}
                            </ContextMenu.Item>
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

    injectEmoji(){ // Upcoming feature
        patch('eu-emoji-element', Emoji.prototype, 'render', (args, res) => {
            console.log("ok i'm here")
            console.log(args, res)
        })
    }

    // ok i have to admit this is bloat at this point
    
    // injectEmojiButton() {
    //     patch("eu-emoji-button-context-menu", ChannelTextAreaContainer.type, "render", (args, res) => {
    //         let buttons = findInReactTree( //Find the button list
    //             res,
    //             (r) =>
    //                 r && r.className && r.className.indexOf("buttons-") == 0
    //         );

    //         let emojiButtomDOM;

    //         buttons.children.map((currentItem) => { // Finds the emoji button container
    //             if (currentItem.ref !== null && currentItem.ref.current.children[0].className.includes("emojiButton-")) {
    //                 emojiButtomDOM = currentItem.ref.current.children[0]
    //             }
    //         })

    //         emojiButtomDOM.oncontextmenu = e => {
    //             let contextMenuSettings = { // Simulate a React SyntheticEvent since openContextMenu doesn't support DOM's PointEvent
    //                 pageX: e.x,
    //                 pageY: e.y,
    //                 className: "context-menu",
    //                 config: {
    //                     context: "APP"
    //                 },
    //                 nativeEvent: e,
    //                 stopPropagation: function () { return true },
    //                 target: e.target,
    //                 currentTarget: e.target,
    //                 timeStamp: e.timeStamp
    //             }

    //             contextMenu.openContextMenu(contextMenuSettings, () => {
    //                 return <ContextMenu.Menu onClose={contextMenu.closeContextMenu}>
    //                     <ContextMenu.Item
    //                         id="eu-open-emoji-folder"
    //                         label="Open emoji folder"
    //                     />
    //                     <ContextMenu.Item
    //                         id="eu-open-emoji-util-settings"
    //                         label="Go to Emoji Util settings"
    //                     />
    //                 </ContextMenu.Menu>
    //             })
    //         }

    //         return res;
    //     });
    // }


    renderRenameModal(title, buttonName, onAcceptChanges, placeholder = "", original = ""){
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
                        {buttonName}
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