import $ from 'jquery'
import { debounce } from 'lodash'

function createSearchInput() {
    const selector = '#searchBookInput'
    if ($(selector).length) return
    $('#shelf').prepend('<input type="text" id="searchBookInput" style="width: -webkit-fill-available; font-style: italic; font-size: 13px; padding: 10px 17px 10px 17px; border: 1px solid #ddd; " placeholder="搜索...">')
    $(selector).on('keyup', debounce(function onSearch() {
        const val: string = $(selector).val() as string
        const filter = val.toUpperCase()
        $('.dropdown-container > a').each((index, el) => {
            const a = $(el)
            const text = a.text().toUpperCase()
            if (text.indexOf(filter) > -1) {
                a.css('display', 'block')
            } else {
                a.css('display', 'none')
            }
        })
    }, 500))
}

export { createSearchInput }
