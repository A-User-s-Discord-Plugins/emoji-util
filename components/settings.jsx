import { React } from "@vizality/react"
import { SwitchItem } from '@vizality/components/settings'

const { updateSetting, getSetting, toggleSetting } = vizality.api.settings._fluxProps(this.addonId)

module.exports = class Settings extends React.PureComponent {
    render(){
        return <>
            <SwitchItem
                children="Display context menu in a submenu"
                note="Instead of displaying 3 items in the emoji menu, it'll display 1 item with 3 items inside it"
                value={getSetting('subMenu', true)}
                onChange={() => {
                    toggleSetting('subMenu')
                }}
            />
        </>
    }
}