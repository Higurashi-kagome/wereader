import React from 'react';

// TODO：指定类型为 DropDownSub？
interface IProps{
    children: React.ReactNode
}

/**
 * 下拉容器
 */
export class DropDownContainer extends React.Component<IProps>{
    render(){
        const P = this.props;
        return (
            <div className="dropdown-container">{P.children}</div>
        )
    }
}