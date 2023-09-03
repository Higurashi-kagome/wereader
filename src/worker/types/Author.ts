import { MedalInfo } from './ThoughtJson'

export interface Author {
    userVid: number;
    name: string;
    avatar: string;
    isFollowing: number;
    isFollower: number;
    isHide: number;
    medalInfo?: MedalInfo;
    nick?: string;
    isV?: number;
    vDesc?: string;
}
