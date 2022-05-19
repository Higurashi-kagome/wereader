import React from 'react';

interface IProps{
	value: string
	id: string
}

/**
 * 调用按钮
 */
export class DropDownCaller extends React.Component<IProps>{
	render(){
		const P = this.props;
		return (
			<a id={P.id} className="caller">{P.value}</a>
		)
	}
}