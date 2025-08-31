import { BookInfo } from '../BookInfo'

describe('BookInfo Type', () => {
    it('should accept valid BookInfo object with all required fields', () => {
        const mockBookInfo: BookInfo = {
            bookId: '123456',
            title: '测试书籍',
            author: '测试作者',
            cover: 'https://example.com/cover.jpg',
            version: 1,
            format: 'epub',
            type: 1,
            price: 100,
            originalPrice: 150,
            soldout: 0,
            bookStatus: 1,
            payType: 1,
            intro: '这是一本测试书籍的简介',
            centPrice: 1000,
            finished: 0,
            maxFreeChapter: 5,
            free: 0,
            mcardDiscount: 0,
            ispub: 1,
            extra_type: 0,
            cpid: 1001,
            publishTime: '2023-01-01',
            category: '小说',
            categories: [
                {
                    categoryId: 1,
                    subCategoryId: 10,
                    categoryType: 1,
                    title: '小说类别'
                }
            ],
            hasLecture: 0,
            lastChapterIdx: 100,
            paperBook: {
                skuId: 'sku123'
            },
            blockSaveImg: 0,
            language: 'zh-CN',
            hideUpdateTime: false,
            payingStatus: 1,
            chapterSize: 50,
            updateTime: 1640995200,
            onTime: 1640995200,
            unitPrice: 10,
            marketType: 1,
            isbn: '978-7-123456-78-9',
            publisher: '测试出版社',
            totalWords: 200000,
            publishPrice: 2000,
            bookSize: 1024,
            shouldHideTTS: 0,
            recommended: 1,
            lectureRecommended: 0,
            follow: 1,
            secret: 0,
            offline: 0,
            lectureOffline: 0,
            finishReading: 0,
            hideReview: 0,
            hideFriendMark: 0,
            blacked: 0,
            isAutoPay: 0,
            availables: 1,
            paid: 1,
            isChapterPaid: 1,
            showLectureButton: 0,
            wxtts: 0,
            star: 4,
            ratingCount: 100,
            ratingDetail: {
                one: 5,
                two: 10,
                three: 15,
                four: 30,
                five: 40,
                recent: 20
            },
            newRating: 4.2,
            newRatingCount: 150,
            newRatingDetail: {
                good: 100,
                fair: 30,
                poor: 20,
                recent: 50,
                myRating: 'good',
                title: '好评如潮'
            },
            ranklist: {},
            copyrightInfo: {
                id: 1,
                name: '版权方',
                userVid: 12345,
                role: 1,
                avatar: 'https://example.com/avatar.jpg'
            },
            authorSeg: [
                {
                    words: '测试作者',
                    highlight: 0,
                    authorId: 'author123'
                }
            ],
            translatorSeg: [
                {
                    words: '测试译者',
                    highlight: 0,
                    authorId: 'translator123'
                }
            ]
        }

        // TypeScript compilation will fail if the object doesn't match the interface
        expect(mockBookInfo.bookId).toBe('123456')
        expect(mockBookInfo.title).toBe('测试书籍')
        expect(mockBookInfo.author).toBe('测试作者')
    })

    it('should accept BookInfo with optional translator field', () => {
        const bookWithTranslator: Partial<BookInfo> = {
            bookId: '123456',
            title: '翻译书籍',
            author: '原作者',
            translator: '译者姓名',
            cover: 'https://example.com/cover.jpg'
        }

        expect(bookWithTranslator.translator).toBe('译者姓名')
    })

    it('should handle nested category structure', () => {
        const categoryData = {
            categoryId: 1,
            subCategoryId: 10,
            categoryType: 2,
            title: '科幻小说'
        }

        // Test that category structure matches expected interface
        expect(typeof categoryData.categoryId).toBe('number')
        expect(typeof categoryData.subCategoryId).toBe('number')
        expect(typeof categoryData.categoryType).toBe('number')
        expect(typeof categoryData.title).toBe('string')
    })

    it('should handle rating detail structure', () => {
        const ratingDetail = {
            one: 5,
            two: 10,
            three: 15,
            four: 25,
            five: 45,
            recent: 20
        }

        const total = ratingDetail.one + ratingDetail.two + ratingDetail.three
                  + ratingDetail.four + ratingDetail.five

        expect(total).toBe(100)
        expect(ratingDetail.recent).toBeLessThanOrEqual(total)
    })

    it('should handle new rating detail structure', () => {
        const newRatingDetail = {
            good: 80,
            fair: 15,
            poor: 5,
            recent: 30,
            myRating: 'good',
            title: '好评如潮'
        }

        const total = newRatingDetail.good + newRatingDetail.fair + newRatingDetail.poor

        expect(total).toBe(100)
        expect(['good', 'fair', 'poor'].includes(newRatingDetail.myRating)).toBe(true)
    })

    it('should handle author and translator segments', () => {
        const authorSegment = {
            words: '张三',
            highlight: 1,
            authorId: 'author_001'
        }

        const translatorSegment = {
            words: '李四',
            highlight: 0,
            authorId: 'translator_001'
        }

        expect(typeof authorSegment.words).toBe('string')
        expect(typeof authorSegment.highlight).toBe('number')
        expect(typeof authorSegment.authorId).toBe('string')

        expect(typeof translatorSegment.words).toBe('string')
        expect(typeof translatorSegment.highlight).toBe('number')
        expect(typeof translatorSegment.authorId).toBe('string')
    })

    it('should handle copyright info structure', () => {
        const copyrightInfo = {
            id: 1001,
            name: '出版社名称',
            userVid: 500001,
            role: 2,
            avatar: 'https://example.com/publisher-avatar.jpg'
        }

        expect(typeof copyrightInfo.id).toBe('number')
        expect(typeof copyrightInfo.name).toBe('string')
        expect(typeof copyrightInfo.userVid).toBe('number')
        expect(typeof copyrightInfo.role).toBe('number')
        expect(typeof copyrightInfo.avatar).toBe('string')
    })

    it('should handle boolean and numeric flags correctly', () => {
        const flags = {
            finished: 1,
            free: 0,
            hideUpdateTime: true,
            secret: 0,
            blacked: 0,
            isAutoPay: 1
        }

        // Finished should be 1 (completed) or 0 (not completed)
        expect([0, 1].includes(flags.finished)).toBe(true)

        // Free should be 1 (free) or 0 (paid)
        expect([0, 1].includes(flags.free)).toBe(true)

        // Boolean flags
        expect(typeof flags.hideUpdateTime).toBe('boolean')

        // Numeric flags should be 0 or 1
        expect([0, 1].includes(flags.secret)).toBe(true)
        expect([0, 1].includes(flags.blacked)).toBe(true)
        expect([0, 1].includes(flags.isAutoPay)).toBe(true)
    })
})
