
export interface Archive {
	archiveId: number;
	name: string;
	bookIds: string[];
	removed: unknown[];
	lectureBookIds: unknown[];
	lectureRemoved: unknown[];
	isTop?: boolean;
}
