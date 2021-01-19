import { React, getModuleByDisplayName } from "@vizality/webpack"
import { SwitchItem } from '@vizality/components/settings'
import TextInputWithButton from "./custom/TextInputWithButton"

const FormText = getModuleByDisplayName("FormText")

const { updateSetting, getSetting, toggleSetting } = vizality.api.settings._fluxProps(this.addonId)

module.exports = class Settings extends React.PureComponent {
    render(){
        return <>
            <TextInputWithButton
                defaultValue={getSetting('saveFolderPath', "")}
                onChange={(value) => {
                    updateSetting('saveFolderPath', value)
                }}
                buttonOnClick={() => 
                    DiscordNative.fileManager.showOpenDialog({ properties: ['openDirectory'] }).then(result => updateSetting('saveFolderPath', result[0]))
                }
                title="Default Emoji Folder"
                buttonText="Select Folder"
                buttonIcon="Folder"
                children={
                    <FormText className="markup-2BOw-j description-3_Ncsb formText-3fs7AJ marginTop8-1DLZ1n eu-form-title">
                        Note: press
                        {" "}<code class="inline">shift + click</code>{" "}
                        if you want to save in a different folder
                    </FormText>
                }
            />

            <SwitchItem
                children="Display context menu in a submenu"
                note="Instead of displaying 3 items in the emoji menu, it'll display 1 item with 3 items inside it"
                value={getSetting('subMenu', true)}
                onChange={() => {
                    toggleSetting('subMenu')
                }}
            />

            <SwitchItem
                children="Colored disabled emojis"
                note="Show colors when hovered a disabled emoji"
                value={getSetting('colorDisabledEmojis', false)}
                onChange={() => {
                    toggleSetting('colorDisabledEmojis')

                    if (getSetting('colorDisabledEmojis', false)) {
                        document.documentElement.setAttribute('eu-colorDisabledEmojis', '')
                    } else {
                        document.documentElement.removeAttribute('eu-colorDisabledEmojis')
                    }
                }}
            />

            <SwitchItem
                disabled={true}
                children={["Send emojis as file ", <sup className='h5-18_1nd'>(Upcoming)</sup>]}
                note="When clicked, emojis are sent like a file"
                value={getSetting('fileEmojis', false)}
                onChange={() => {
                    toggleSetting('fileEmojis')
                }}
            />
        </>
    }
}