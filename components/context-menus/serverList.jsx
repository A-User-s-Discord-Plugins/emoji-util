import React, { memo } from 'react'
import { getModule } from "@vizality/webpack"
import { ContextMenu } from '@vizality/components';

import EmojiUtility from "../../modules/EmojiUtility"

const { getFlattenedGuilds } = getModule("getFlattenedGuilds")

export default function(onSelect) {
    let guildsWithPerm = listGuildsWithManageEmojiPermission()

    let returnResult = []
    guildsWithPerm.map((guild) => {
        returnResult.push(<ContextMenu.Item
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
                onSelect(guild)
            }}
        />)
    })

    return returnResult
}

const listGuildsWithManageEmojiPermission = function () {
    let guildList = getFlattenedGuilds();
    let guildsWithPerm = [];
    guildList.map((guild) => {
        if (EmojiUtility.canManageEmojis(guild.id)) {
            guildsWithPerm.push(guild)
        }
    })
    return guildsWithPerm
}