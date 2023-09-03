import $ from 'jquery'

import { PopupApi } from '../../worker/types/PopupApi'

// 背景页
const popupApi = new PopupApi()
// 测试 url 是否为阅读页的正则表达式 /:\/\/weread\.qq\.com\/web\/reader\/[^\s]*/
const readPageRegexp = /:\/\/weread\.qq\.com\/web\/reader\/[^\s]*/

// 下拉按钮点击事件
// eslint-disable-next-line no-unused-vars
const dropdownClickEvent = function (this: HTMLElement) {
    $(this).toggleClass('active')
    $(this).next().toggle()
}

// https://www.geeksforgeeks.org/sort-the-array-in-a-given-index-range/
function partSort(
    arr: Array<any>,
    a: number,
    b: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fun = (x: any, y: any)=>{ return x - y }
) {
    // Variables to store start and end of the index range
    const l = Math.min(a, b)
    const r = Math.max(a, b)
    // Temporary array
    const temp = new Array(r - l + 1)
    for (let i = l, j = 0; i <= r; i++, j++) {
        temp[j] = arr[i]
    }
    // Sort the temporary array
    temp.sort(fun)
    // Modifying original array with temporary array elements
    for (let i = l, j = 0; i <= r; i++, j++) {
        arr[i] = temp[j]
    }
}

export {
    popupApi, dropdownClickEvent, partSort, readPageRegexp
}
