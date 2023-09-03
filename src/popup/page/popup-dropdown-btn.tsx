import React, { ButtonHTMLAttributes, DetailedHTMLProps } from 'react';

interface IProps{
    value: string
}

declare global {
    namespace JSX {
      interface IntrinsicElements {
        button: DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
      }
    }
}

/**
 * 下拉按钮
 */
export class DropDownBtn extends React.Component<IProps>{
    render(){
        const P = this.props;
        return (
            <button className="dropdown-btn">{this.props.value}</button>
        )
    }
}