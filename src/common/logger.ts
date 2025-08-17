/* eslint-disable */
export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}
/* eslint-enable */

class Logger {
    private currentLevel: LogLevel = LogLevel.DEBUG

    setLevel(level: LogLevel) {
        this.currentLevel = level
    }

    /* eslint-disable */
    private formatMessage(level: string, ...args: any[]): string[] {
        const timestamp = new Date().toLocaleString()
        return [`[${timestamp}][${level}]`, ...args]
    }
    /* eslint-enable */

    debug(...args: any[]) {
        if (this.currentLevel <= LogLevel.DEBUG) {
            console.debug(...this.formatMessage('DEBUG', ...args))
        }
    }

    info(...args: any[]) {
        if (this.currentLevel <= LogLevel.INFO) {
            console.info(...this.formatMessage('INFO', ...args))
        }
    }

    warn(...args: any[]) {
        if (this.currentLevel <= LogLevel.WARN) {
            console.warn(...this.formatMessage('WARN', ...args))
        }
    }

    error(...args: any[]) {
        if (this.currentLevel <= LogLevel.ERROR) {
            console.error(...this.formatMessage('ERROR', ...args))
        }
    }
}

export const logger = new Logger()
