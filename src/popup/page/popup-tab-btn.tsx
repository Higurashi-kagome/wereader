import React from 'react';

interface IProps{
	id: string;
	value: string
}

/**
 * tab 按钮
 */
export class TabBtn extends React.Component<IProps>{
	render(){
		const P = this.props;
		return (<button className="tabLinks" id={P.id}>{P.value}</button>)
	}
}