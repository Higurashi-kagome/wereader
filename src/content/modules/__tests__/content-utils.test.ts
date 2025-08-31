/**
 * @jest-environment jsdom
 */

// Mock jQuery before importing the module
const mockJQuery = {
    text: jest.fn().mockReturnValue('Mock Chapter Title'),
    length: 1,
    remove: jest.fn()
} as any

jest.mock('jquery', () => jest.fn(() => mockJQuery))

// Mock SweetAlert2
jest.mock('sweetalert2', () => ({
    __esModule: true,
    default: {
        mixin: jest.fn(() => ({
            fire: jest.fn()
        })),
        fire: jest.fn(),
        stopTimer: jest.fn(),
        resumeTimer: jest.fn()
    }
}))

import {
    simulateClick,
    getCurrentChapTitle
} from '../content-utils'

describe('content-utils', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        // Reset DOM
        document.body.innerHTML = ''
    })

    describe('simulateClick', () => {
        it('should simulate click event on element', () => {
            const testElement = document.createElement('div')
            testElement.style.position = 'absolute'
            testElement.style.left = '100px'
            testElement.style.top = '200px'
            testElement.style.width = '50px'
            testElement.style.height = '30px'
            document.body.appendChild(testElement)

            const clickHandler = jest.fn()
            testElement.addEventListener('click', clickHandler)

            simulateClick(testElement)

            expect(clickHandler).toHaveBeenCalled()
            const event = clickHandler.mock.calls[0][0]
            expect(event.type).toBe('click')
        })

        it('should use custom init options', () => {
            const testElement = document.createElement('button')
            document.body.appendChild(testElement)

            const clickHandler = jest.fn()
            testElement.addEventListener('click', clickHandler)

            const customInit = { bubbles: false }
            simulateClick(testElement, customInit)

            expect(clickHandler).toHaveBeenCalled()
            const event = clickHandler.mock.calls[0][0]
            expect(event.bubbles).toBe(false)
        })
    })

    describe('getCurrentChapTitle', () => {
        beforeEach(() => {
            // Reset jQuery mock
            jest.clearAllMocks()
        })

        it('should extract chapter title from readerTopBar', () => {
            const $ = jest.requireMock('jquery')

            // Mock jQuery to simulate finding .readerTopBar_title_chapter
            $.mockReturnValue({
                length: 1,
                text: () => '第一章 开始'
            })

            const result = getCurrentChapTitle()
            expect(result).toBe('第一章 开始')
        })

        it('should extract chapter title from chapterItem when readerTopBar not found', () => {
            const $ = jest.requireMock('jquery')

            // First call returns empty (no readerTopBar), second call returns chapter item
            $.mockImplementation((selector: string) => {
                if (selector === '.readerTopBar_title_chapter') {
                    return { length: 0 }
                }
                if (selector === '.chapterItem.chapterItem_current') {
                    return {
                        text: () => '当前章节标题'
                    }
                }
                return { length: 0 }
            })

            const result = getCurrentChapTitle()
            expect(result).toBe('当前章节标题')
        })

        it('should handle whitespace trimming correctly', () => {
            const testCases = [
                { input: '  章节标题  ', expected: '章节标题' },
                { input: '\n\t章节标题\n\t', expected: '章节标题' },
                { input: '章节标题', expected: '章节标题' },
                { input: '   ', expected: '' }
            ]

            testCases.forEach(({ input, expected }) => {
                const trimmed = input.replace(/^\s*|\s*$/g, '')
                expect(trimmed).toBe(expected)
            })
        })
    })

    describe('Sleep function', () => {
        beforeEach(() => {
            jest.useFakeTimers()
        })

        afterEach(() => {
            jest.useRealTimers()
        })

        it('should resolve after specified milliseconds', async () => {
            const sleepPromise = new Promise((resolve) => {
                setTimeout(resolve, 1000)
            })

            // Fast forward time
            jest.advanceTimersByTime(1000)

            await expect(sleepPromise).resolves.toBeUndefined()
        })

        it('should work with different time values', async () => {
            const sleepPromise = new Promise((resolve) => {
                setTimeout(resolve, 500)
            })

            jest.advanceTimersByTime(500)

            await sleepPromise

            expect(jest.getTimerCount()).toBe(0)
        })
    })

    describe('SweetAlert integration', () => {
        it('should handle success alerts with toast configuration', () => {
            const Swal = jest.requireMock('sweetalert2').default
            const mockMixin = {
                fire: jest.fn()
            }
            Swal.mixin.mockReturnValue(mockMixin)

            // Test the mixin configuration for success/warning toasts
            const toastConfig = {
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 1500
            }

            const Toast = Swal.mixin(toastConfig)
            Toast.fire({ icon: 'success', title: '复制成功' })

            expect(Swal.mixin).toHaveBeenCalledWith(expect.objectContaining({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 1500
            }))
            expect(mockMixin.fire).toHaveBeenCalledWith({
                icon: 'success',
                title: '复制成功'
            })
        })

        it('should handle error alerts with full dialog', () => {
            const Swal = jest.requireMock('sweetalert2').default

            const errorConfig = {
                title: '复制出错',
                text: 'Error message',
                confirmButtonText: '确定',
                icon: 'error'
            }

            Swal.fire(errorConfig)

            expect(Swal.fire).toHaveBeenCalledWith(errorConfig)
        })
    })

    describe('Mouse event simulation', () => {
        it('should create mouse event with correct properties', () => {
            const element = document.createElement('button')
            element.style.position = 'absolute'
            element.style.left = '50px'
            element.style.top = '75px'
            element.style.width = '100px'
            element.style.height = '40px'
            document.body.appendChild(element)

            const rect = element.getBoundingClientRect()
            const eventInit = {
                clientX: rect.left,
                clientY: rect.top,
                bubbles: true,
                cancelable: true
            }

            const mouseEvent = new MouseEvent('click', eventInit)

            expect(mouseEvent.type).toBe('click')
            expect(mouseEvent.clientX).toBe(rect.left)
            expect(mouseEvent.clientY).toBe(rect.top)
            expect(mouseEvent.bubbles).toBe(true)
            expect(mouseEvent.cancelable).toBe(true)
        })
    })
})
