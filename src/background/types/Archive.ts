
export interface Archive {
	archiveId: number;
	name: string;
	bookIds: string[];
	removed: any[];
	lectureBookIds: any[];
	lectureRemoved: any[];
	isTop?: boolean;
}
