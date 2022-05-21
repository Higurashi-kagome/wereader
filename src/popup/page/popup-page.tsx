import React, { FC } from 'react';

import { createRoot } from 'react-dom/client';

import { TabBtn } from './popup-tab-btn';
import { TabBtnContainer } from './popup-tab-btn-container';
import { TabContent } from './popup-tab-content';
import { NoteTabContent } from './popup-tab-content-note';

interface IProps{

}

/**
 * popup 全部内容
 */
export const Popup: FC<IProps> = () => {
	return (
		<div>
			<TabBtnContainer>
				<TabBtn id='shelfBtn' value='书架'></TabBtn>
			</TabBtnContainer>
			<NoteTabContent/>
			<TabContent for='shelfBtn' id='shelf'>
				<a>...</a>
			</TabContent>
		</div>
	);
}

createRoot(document.getElementById('popup-container')!).render(<Popup/>);