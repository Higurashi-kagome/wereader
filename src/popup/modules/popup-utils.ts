import $ from "jquery";

// 背景页
const bg: any = chrome.extension.getBackgroundPage()!.popupApi;
// 测试 url 是否为阅读页的正则表达式 /:\/\/weread\.qq\.com\/web\/reader\/[^\s]*/
const readPageRegexp = /:\/\/weread\.qq\.com\/web\/reader\/[^\s]*/;

// 下拉按钮点击事件
// TODO：类型信息
const dropdownClickEvent = function(this: any){
	$(this).toggleClass("active");
	$(this).next().toggle();
}

// https://www.geeksforgeeks.org/sort-the-array-in-a-given-index-range/
function partSort(arr: Array<any>, a: number, b: number, fun = function(a: any, b: any){return a - b})
{
	// Variables to store start and end of the index range
	let l = Math.min(a, b);
	let r = Math.max(a, b);

	// Temporary array
	let temp = new Array(r - l + 1);
	for (let i = l, j = 0; i <= r; i++, j++) {
		temp[j] = arr[i];
	}

	// Sort the temporary array
	temp.sort(fun);

	// Modifying original array with temporary array elements
	for (let i = l, j = 0; i <= r; i++, j++) {
		arr[i] = temp[j];
	}
}

export {
	bg, readPageRegexp,
	dropdownClickEvent,
	partSort
};