import React from 'react';

interface IProps{
	children: React.ReactNode
}

/**
 * tab 按钮的父元素（容器）
 */
export class TabBtnContainer extends React.Component<IProps>{
	render(){
		const P = this.props;
		return (
			<div className="tab">{P.children}</div>
		)
	}
}