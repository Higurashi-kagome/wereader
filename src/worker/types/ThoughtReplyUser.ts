import { MedalInfo } from './ThoughtJson'

export interface ThoughtReplyUser {
	userVid: number;
	name: string;
	avatar: string;
	isFollowing: number;
	isFollower: number;
	isHide: number;
	nick?: string;
	medalInfo?: MedalInfo;
}
