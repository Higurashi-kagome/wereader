import React from 'react';

import { DropDownBtn } from './popup-dropdown-btn';
import { DropDownCaller } from './popup-dropdown-caller';
import { DropDownContainer } from './popup-dropdown-container';
import { TabContent } from './popup-tab-content';

interface IProps{
	
}

/**
 * 笔记功能的内容
 */
export class NoteTabContent extends React.Component<IProps>{
	render(){
		const P = this.props;
		return (
			<TabContent for='noteBtn' >
				<DropDownBtn value='获取书评'></DropDownBtn>
				<DropDownContainer>
					<DropDownCaller id="getTextComment" value='纯文本'></DropDownCaller>
					<DropDownCaller id="getHtmlComment" value='HTML'></DropDownCaller>
				</DropDownContainer>
				<DropDownBtn value='获取标注'></DropDownBtn>
				<DropDownContainer>
					<DropDownCaller id="getMarksInCurChap" value='本章'></DropDownCaller>
					<DropDownCaller id="getAllMarks" value='全部'></DropDownCaller>
				</DropDownContainer>
				<DropDownCaller id="getContents" value='获取目录'></DropDownCaller>
				<DropDownCaller id="getBestBookMarks" value='获取热门标注'></DropDownCaller>
				<DropDownCaller id="getMyThoughts" value='获取我的想法'></DropDownCaller>
				<DropDownBtn value='删除标注'></DropDownBtn>
				<DropDownContainer>
					<DropDownCaller id="removeMarksInCurChap" value='本章'></DropDownCaller>
					<DropDownCaller id="removeAllMarks" value='全部'></DropDownCaller>
				</DropDownContainer>
			</TabContent>
		)
	}
}