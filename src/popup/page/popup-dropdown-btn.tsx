import React from 'react';

interface IProps{
	value: string
}

declare global {
	namespace JSX {
	  interface IntrinsicElements {
		button: any;
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