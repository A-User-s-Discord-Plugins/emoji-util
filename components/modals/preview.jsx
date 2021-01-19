const { close: closeModal } = require('@vizality/modal')
import { Modal, ImageModal } from '@vizality/components';
import { SliderInput } from '@vizality/components/settings';
import { React } from "@vizality/webpack"

export default class FileContextMenu extends React.Component {
    constructor(props) {
        super(props)

        this.emoji = this.props.emojiUrl;

        this.state = {
            emojiMultiplier: 2.5
        }
    }
    
    render(){
        let width = 50 * this.state.emojiMultiplier
        let height = 50 * this.state.emojiMultiplier
        return <>
            <ImageModal
                className="image-1tIMwV"
                src={this.emoji}
                width={width}
                height={height}
            />
            <SliderInput
                stickToMarkers
                initialValue={2.5}
                markers={[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6]}
                className='eu-preview-slider'
                onMarkerRender={renderVal => renderVal + "x"}
                // defaultValue={1}
                onValueChange={value => {
                    this.setState({ emojiMultiplier: value })
                }}
            >
            </SliderInput>
        </>
    }
}