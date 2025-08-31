import '@testing-library/jest-dom'

// Mock Chrome APIs
global.chrome = {
    runtime: {
        sendMessage: jest.fn(),
        onMessage: {
            addListener: jest.fn(),
            removeListener: jest.fn()
        },
        getURL: jest.fn((path) => `chrome-extension://test-id/${path}`),
        id: 'test-extension-id'
    },
    storage: {
        local: {
            get: jest.fn(),
            set: jest.fn(),
            remove: jest.fn(),
            clear: jest.fn()
        },
        sync: {
            get: jest.fn(),
            set: jest.fn(),
            remove: jest.fn(),
            clear: jest.fn()
        }
    },
    tabs: {
        query: jest.fn(),
        sendMessage: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        remove: jest.fn()
    }
} as any;

// Mock jQuery if needed
(global as any).$ = (global as any).jQuery = jest.fn(() => ({
    on: jest.fn(),
    off: jest.fn(),
    trigger: jest.fn(),
    addClass: jest.fn(),
    removeClass: jest.fn(),
    toggleClass: jest.fn(),
    hasClass: jest.fn(),
    attr: jest.fn(),
    removeAttr: jest.fn(),
    val: jest.fn(),
    text: jest.fn(),
    html: jest.fn(),
    append: jest.fn(),
    prepend: jest.fn(),
    remove: jest.fn(),
    hide: jest.fn(),
    show: jest.fn(),
    toggle: jest.fn(),
    find: jest.fn(),
    parent: jest.fn(),
    children: jest.fn(),
    siblings: jest.fn(),
    closest: jest.fn(),
    each: jest.fn()
}))
