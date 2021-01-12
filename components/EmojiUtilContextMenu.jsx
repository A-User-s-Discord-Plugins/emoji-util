//sorry for doing this, Menu only accepts MenuItem or MenuGroup
import { clipboard } from "electron"
import { React, getModule } from "@vizality/webpack"
import { Menu } from '@vizality/components';

const { getFlattenedGuilds } = getModule("getFlattenedGuilds")
const { getGuildPermissions } = getModule("getGuildPermissions")

export default function (emojiUrl, emojiName, emojiID){
    let guildsWithPerm = this.listServersWithManageEmojiPermission()

    return <>
        <Menu.MenuItem
            id='eu-clone'
            label='Clone'
        >
            {
                guildsWithPerm.map((guild) => {
                    return <Menu.MenuItem
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
                                this.log("emoji uploaded hvae fun")
                            }).catch(err => {
                                this.error(err)
                            })
                        }}
                    />
                })
            }
        </Menu.MenuItem>

        <Menu.MenuItem
            id='eu-copy'
            label='Copy'
        >
            <Menu.MenuItem
                id='eu-copy-url'
                label='URL'
                action={() => {
                    clipboard.writeText(emojiUrl)
                }}
            />
            <Menu.MenuItem
                id='eu-copy-name'
                label='Name'
                action={() => {
                    clipboard.writeText(emojiName)
                }}
            />
            <Menu.MenuItem
                id='eu-copy-id'
                label='ID'
                action={() => {
                    clipboard.writeText(emojiID)
                }}
            />
        </Menu.MenuItem>
    </>
}

const listGuildsWithManageEmojiPermission = function() {
    let guildList = getFlattenedGuilds();
    let guildsWithPerm = [];
    guildList.map((guild) => {
        let guildperms = getGuildPermissions(guild.id)
        if (guildperms && (guildperms & constants.Permissions.MANAGE_EMOJIS) !== 0) {
            guildsWithPerm.push(guild)
        }
    })
    return guildsWithPerm
}