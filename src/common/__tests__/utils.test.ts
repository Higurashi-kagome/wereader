import {
    getLocalStorage, getSyncStorage, getConfig, sortByKey, formatTimestamp, commandCopy
} from '../utils'

describe('utils', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset runtime error
        (global.chrome as any).runtime.lastError = undefined
    })

    describe('getLocalStorage', () => {
        it('should get all local storage when key is null', async () => {
            const mockData = { key1: 'value1', key2: 'value2' };
            (global.chrome as any).storage.local.get = jest.fn((callback: any) => {
                callback(mockData)
            })

            const result = await getLocalStorage(null)
            expect(result).toEqual(mockData)
            expect((global.chrome as any).storage.local.get)
                .toHaveBeenCalledWith(expect.any(Function))
        })

        it('should get specific key from local storage', async () => {
            const mockData = { testKey: 'testValue' };
            (global.chrome as any).storage.local.get = jest.fn((keys: any, callback: any) => {
                callback(mockData)
            })

            const result = await getLocalStorage('testKey')
            expect(result).toBe('testValue')
            expect((global.chrome as any).storage.local.get).toHaveBeenCalledWith(['testKey'], expect.any(Function))
        })

        it('should reject with error message when chrome runtime has error', async () => {
            (global.chrome as any).runtime.lastError = { message: 'Test error' };
            (global.chrome as any).storage.local.get = jest.fn((keys: any, callback: any) => {
                if (typeof keys === 'function') {
                    // Single parameter callback case
                    keys({})
                } else {
                    // Keys and callback case
                    callback({})
                }
            })

            await expect(getLocalStorage('testKey')).rejects.toBe('Test error')
        })
    })

    describe('getSyncStorage', () => {
        it('should get all sync storage when key is null', async () => {
            const mockData = { config1: 'value1', config2: 'value2' };
            (global.chrome as any).storage.sync.get = jest.fn((keys: any, callback: any) => {
                callback(mockData)
            })

            const result = await getSyncStorage(null)
            expect(result).toEqual(mockData)
            expect((global.chrome as any).storage.sync.get)
                .toHaveBeenCalledWith(null, expect.any(Function))
        })

        it('should get specific key from sync storage', async () => {
            const mockData = { testKey: 'testValue' };
            (global.chrome as any).storage.sync.get = jest.fn((keys: any, callback: any) => {
                callback(mockData)
            })

            const result = await getSyncStorage('testKey')
            expect(result).toBe('testValue')
            expect((global.chrome as any).storage.sync.get).toHaveBeenCalledWith(['testKey'], expect.any(Function))
        })

        it('should handle array of keys', async () => {
            const mockData = { key1: 'value1', key2: 'value2' };
            (global.chrome as any).storage.sync.get = jest.fn((keys: any, callback: any) => {
                callback(mockData)
            })

            const result = await getSyncStorage(['key1', 'key2'])
            expect(result).toEqual(mockData)
            expect((global.chrome as any).storage.sync.get).toHaveBeenCalledWith(['key1', 'key2'], expect.any(Function))
        })

        it('should reject with error message when chrome runtime has error', async () => {
            (global.chrome as any).runtime.lastError = { message: 'Sync error' };
            (global.chrome as any).storage.sync.get = jest.fn((keys: any, callback: any) => {
                callback({})
            })

            await expect(getSyncStorage('testKey')).rejects.toBe('Sync error')
        })
    })

    describe('getConfig', () => {
        it('should return sync storage as config', async () => {
            const mockConfig = { setting1: 'value1', setting2: 'value2' };
            (global.chrome as any).storage.sync.get = jest.fn((keys: any, callback: any) => {
                callback(mockConfig)
            })

            const result = await getConfig()
            expect(result).toEqual(mockConfig)
        })
    })

    describe('sortByKey', () => {
        it('should sort array by integer key in ascending order', () => {
            const testArray = [
                { id: '3', name: 'third' },
                { id: '1', name: 'first' },
                { id: '2', name: 'second' }
            ]

            const result = sortByKey(testArray, 'id')

            expect(result).toEqual([
                { id: '1', name: 'first' },
                { id: '2', name: 'second' },
                { id: '3', name: 'third' }
            ])
        })

        it('should handle equal values', () => {
            const testArray = [
                { order: '2', name: 'second' },
                { order: '1', name: 'first' },
                { order: '2', name: 'second_duplicate' }
            ]

            const result = sortByKey(testArray, 'order')
            expect(result[0].order).toBe('1')
            expect(result[1].order).toBe('2')
            expect(result[2].order).toBe('2')
        })

        it('should handle empty array', () => {
            const result = sortByKey([], 'id')
            expect(result).toEqual([])
        })
    })

    describe('formatTimestamp', () => {
        it('should format timestamp to readable date string', () => {
            const timestamp = 1640995200 // 2022-01-01 00:00:00 UTC
            const result = formatTimestamp(timestamp)
            // Test the format without checking specific time (to avoid timezone issues)
            expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
        })

        it('should pad single digit values correctly', () => {
            // Create a timestamp that will result in single digit values when formatted
            const date = new Date(2023, 1, 3, 4, 5, 6) // Feb 3, 2023, 04:05:06
            const timestamp = Math.floor(date.getTime() / 1000)
            const result = formatTimestamp(timestamp)

            // Check that the result includes padded values
            expect(result).toMatch(/^2023-02-03 \d{2}:05:06$/)
        })

        it('should handle year, month, and day formatting', () => {
            const timestamp = 1640995200 // Known timestamp
            const result = formatTimestamp(timestamp)
            const parts = result.split(' ')
            const datePart = parts[0]
            const timePart = parts[1]

            expect(datePart).toMatch(/^\d{4}-\d{2}-\d{2}$/)
            expect(timePart).toMatch(/^\d{2}:\d{2}:\d{2}$/)
        })
    })

    describe('commandCopy', () => {
        let mockTextarea: HTMLTextAreaElement
        let originalExecCommand: any

        beforeEach(() => {
            // Mock document.querySelector and execCommand
            mockTextarea = document.createElement('textarea')
            mockTextarea.select = jest.fn()

            jest.spyOn(document, 'querySelector').mockReturnValue(mockTextarea)

            // Mock execCommand
            originalExecCommand = document.execCommand;
            (document as any).execCommand = jest.fn(() => true)
        })

        afterEach(() => {
            jest.restoreAllMocks()
            if (originalExecCommand) {
                (document as any).execCommand = originalExecCommand
            }
        })

        it('should copy text to clipboard using textarea', () => {
            const testText = 'Hello, World!'
            const testSelector = '#copy-textarea'

            commandCopy(testText, testSelector)

            expect(document.querySelector).toHaveBeenCalledWith(testSelector)
            expect(mockTextarea.value).toBe(testText)
            expect(mockTextarea.select).toHaveBeenCalled()
            expect((document as any).execCommand).toHaveBeenCalledWith('copy')
        })

        it('should handle empty text', () => {
            const testText = ''
            const testSelector = '#copy-textarea'

            commandCopy(testText, testSelector)

            expect(mockTextarea.value).toBe('')
            expect(mockTextarea.select).toHaveBeenCalled()
            expect((document as any).execCommand).toHaveBeenCalledWith('copy')
        })
    })
})
