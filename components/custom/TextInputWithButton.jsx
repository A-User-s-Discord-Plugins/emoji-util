// Thanks for M|-|4r13y ツ#1051 (Harley) for making this component

import { React, getModule } from '@vizality/webpack'
import { Flex, Icon } from '@vizality/components'
import { FormItem } from '@vizality/components/settings'

const ButtonLink = getModule(m => m.ButtonLink, false).default;

module.exports = class TextInputWithButton extends React.PureComponent {
    constructor(props) {
        super(props);

        this.classes = getModule('container', 'editIcon', false);
        this.iconStyles = (props.buttonIcon && {
            color: 'var(--text-normal)',
            lineHeight: 0,
            backgroundImage: 'none',
            marginTop: 0
        }) || {};
    }

    handleChange(e) {
        if (typeof this.props.onChange === 'function') {
            this.props.onChange(e.currentTarget.value);
        }
    }

    render() {
        const { title, disabled, placeholder, buttonOnClick, buttonIcon } = this.props;
        return (
            <FormItem title={title}>
                <div className={['smartTypers-input', this.classes.container, this.classes.hasValue, disabled && this.classes.disabled].join(' ')}>
                    <Flex className={this.classes.layout}>
                        <Flex.Child className={this.classes.input.split(' ').splice(1).join(' ')} style={{ cursor: 'auto' }}>
                            <input type='text' value={this.props.defaultValue} placeholder={placeholder} disabled={disabled} onChange={this.handleChange.bind(this)}></input>
                        </Flex.Child>
                        <Flex shrink={1} grow={0} style={{ margin: 0 }}>
                            <ButtonLink className={this.classes.button} disabled={disabled} size={ButtonLink.Sizes.MIN} color={ButtonLink.Colors.BRAND} look={ButtonLink.Looks.GHOST} onClick={buttonOnClick}>
                                <span className={this.classes.text}>{this.props.buttonText}</span>
                                <Icon className={this.classes.editIcon + " qi-text-input-with-button-icon"} name={buttonIcon} />
                            </ButtonLink>
                        </Flex>
                    </Flex>
                </div>
                {this.props.children}
            </FormItem>
        );
    }
};
