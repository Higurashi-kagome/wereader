import { Book } from '../Book'

describe('Book Type', () => {
    it('should accept valid Book object with required fields', () => {
        const mockBook: Book = {
            bookId: 'book123',
            title: '简化书籍信息',
            cover: 'https://example.com/cover.jpg',
            format: 'epub',
            version: 1,
            soldout: 0,
            bookStatus: 1,
            author: '作者姓名'
        }

        expect(mockBook.bookId).toBe('book123')
        expect(mockBook.title).toBe('简化书籍信息')
        expect(mockBook.author).toBe('作者姓名')
        expect(mockBook.format).toBe('epub')
    })

    it('should accept Book with all optional fields', () => {
        const fullBook: Book = {
            // Required fields
            bookId: 'book456',
            title: '完整书籍信息',
            cover: 'https://example.com/cover2.jpg',
            format: 'pdf',
            version: 2,
            soldout: 0,
            bookStatus: 1,
            author: '完整作者信息',

            // Optional fields
            lastChapterCreateTime: 1640995200,
            centPrice: 2000,
            finished: 1,
            maxFreeChapter: 10,
            free: 0,
            mcardDiscount: 0,
            ispub: 1,
            updateTime: 1640995200,
            publishTime: '2023-01-01',
            hasLecture: 0,
            lastChapterIdx: 50,
            paperBook: {
                skuId: 'paper123'
            },
            secret: 0,
            readUpdateTime: 1640995200,
            finishReading: 1,
            paid: 1,
            extra_type: 0,
            lPushName: '推送名称',
            authorVids: 'vid123,vid456',
            isTop: true,
            type: 1,
            originalPrice: 3000,
            category: '文学',
            payType: 1,
            price: 2500
        }

        expect(fullBook.finished).toBe(1)
        expect(fullBook.isTop).toBe(true)
        expect(fullBook.paperBook?.skuId).toBe('paper123')
        expect(fullBook.lPushName).toBe('推送名称')
    })

    it('should handle optional paperBook structure', () => {
        const bookWithPaper: Book = {
            bookId: 'book789',
            title: '纸质书',
            cover: 'cover.jpg',
            format: 'epub',
            version: 1,
            soldout: 0,
            bookStatus: 1,
            author: '作者',
            paperBook: {
                skuId: 'sku789'
            }
        }

        const bookWithoutPaper: Book = {
            bookId: 'book790',
            title: '纯电子书',
            cover: 'cover2.jpg',
            format: 'epub',
            version: 1,
            soldout: 0,
            bookStatus: 1,
            author: '作者2'
            // paperBook is optional, so we don't include it
        }

        expect(bookWithPaper.paperBook?.skuId).toBe('sku789')
        expect(bookWithoutPaper.paperBook).toBeUndefined()
    })

    it('should handle boolean isTop field', () => {
        const topBook: Book = {
            bookId: 'top1',
            title: '置顶书籍',
            cover: 'cover.jpg',
            format: 'epub',
            version: 1,
            soldout: 0,
            bookStatus: 1,
            author: '作者',
            isTop: true
        }

        const normalBook: Book = {
            bookId: 'normal1',
            title: '普通书籍',
            cover: 'cover.jpg',
            format: 'epub',
            version: 1,
            soldout: 0,
            bookStatus: 1,
            author: '作者',
            isTop: false
        }

        expect(topBook.isTop).toBe(true)
        expect(normalBook.isTop).toBe(false)
        expect(typeof topBook.isTop).toBe('boolean')
    })

    it('should handle numeric flags correctly', () => {
        const book: Book = {
            bookId: 'flags1',
            title: '标志测试',
            cover: 'cover.jpg',
            format: 'epub',
            version: 1,
            soldout: 0,
            bookStatus: 1,
            author: '作者',
            finished: 1,
            free: 0,
            secret: 0,
            finishReading: 1,
            paid: 1
        }

        // Test that numeric flags are within expected range (usually 0 or 1)
        expect([0, 1].includes(book.finished || 0)).toBe(true)
        expect([0, 1].includes(book.free || 0)).toBe(true)
        expect([0, 1].includes(book.secret || 0)).toBe(true)
        expect([0, 1].includes(book.finishReading || 0)).toBe(true)
        expect([0, 1].includes(book.paid || 0)).toBe(true)
    })

    it('should handle price fields correctly', () => {
        const pricedBook: Book = {
            bookId: 'priced1',
            title: '付费书籍',
            cover: 'cover.jpg',
            format: 'epub',
            version: 1,
            soldout: 0,
            bookStatus: 1,
            author: '作者',
            centPrice: 1500, // 15.00元
            originalPrice: 2000, // 20.00元
            price: 1500 // 15.00元
        }

        expect(typeof pricedBook.centPrice).toBe('number')
        expect(typeof pricedBook.originalPrice).toBe('number')
        expect(typeof pricedBook.price).toBe('number')

        // Price should be less than or equal to original price
        expect(pricedBook.price).toBeLessThanOrEqual(pricedBook.originalPrice || 0)
    })

    it('should handle timestamp fields', () => {
        const timestampBook: Book = {
            bookId: 'timestamp1',
            title: '时间测试',
            cover: 'cover.jpg',
            format: 'epub',
            version: 1,
            soldout: 0,
            bookStatus: 1,
            author: '作者',
            lastChapterCreateTime: 1640995200,
            updateTime: 1640995300,
            readUpdateTime: 1640995400
        }

        expect(typeof timestampBook.lastChapterCreateTime).toBe('number')
        expect(typeof timestampBook.updateTime).toBe('number')
        expect(typeof timestampBook.readUpdateTime).toBe('number')

        // Timestamps should be positive numbers
        expect(timestampBook.lastChapterCreateTime).toBeGreaterThan(0)
        expect(timestampBook.updateTime).toBeGreaterThan(0)
        expect(timestampBook.readUpdateTime).toBeGreaterThan(0)
    })

    it('should handle string fields correctly', () => {
        const stringBook: Book = {
            bookId: 'str1',
            title: '字符串测试',
            cover: 'cover.jpg',
            format: 'mobi',
            version: 1,
            soldout: 0,
            bookStatus: 1,
            author: '字符串作者',
            publishTime: '2023-12-01',
            lPushName: '推送标题',
            authorVids: 'vid1,vid2,vid3',
            category: '科技'
        }

        expect(typeof stringBook.publishTime).toBe('string')
        expect(typeof stringBook.lPushName).toBe('string')
        expect(typeof stringBook.authorVids).toBe('string')
        expect(typeof stringBook.category).toBe('string')

        // publishTime should match date format
        expect(stringBook.publishTime).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
})
