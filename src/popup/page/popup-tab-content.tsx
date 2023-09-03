import React from 'react';

interface IProps {
    id?: string;
    for: string;
    children: React.ReactNode
}

/**
 * 标签内容
 */
export class TabContent extends React.Component<IProps>{
    render(){
        const P = this.props;
        return (
            <div className="tabContent vertical-menu" data-for={P.for} id={P.id}>
                {P.children}
            </div>
        )
    }
}