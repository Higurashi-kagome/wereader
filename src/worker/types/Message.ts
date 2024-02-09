/* eslint-disable no-unused-vars */
/**
 * 消息类型
 */
export enum MessageType {
    /**
     * 显式确认弹窗
     */
    ShowConfirm
}
/* eslint-enable no-unused-vars */

/**
 * 通信消息格式
 */
export interface Message {
    target: string,
    type: string | MessageType,
    data: string | number | {[key: string]: unknown} | null
}
