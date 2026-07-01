const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const helper = require('./test_helper')
const assert = require('node:assert')

const api = supertest(app)

beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
})

describe('GET', () => {

    test('returns as json', async () => {
        await api.get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('all returns all of the blogs', async () => {
        const response = await api.get('/api/blogs')

        assert.strictEqual(response.body.length, helper.initialBlogs.length)
    })

    test('all blogs, a specific blog is within the returned blogs', async () => {
        const response = await api.get('/api/blogs')

        const blogs = response.body.map(blog => blog.title)
        assert.strictEqual(blogs.includes('React patterns'), true)
    })

    describe('a specific blog', () => {
        test('returns the blog if valid id', async () => {
            const response = await api.get(`/api/blogs/${helper.initialBlogs[2]._id}`)

            assert.strictEqual(response.body.title, helper.initialBlogs[2].title)
        })

        test('returns bad request if invalid id', async () => {
            await api.get('/api/blogs/invalid-id').expect(400)
        })

        test('returns not found if id in valid format but not in db', async () => {
            await api.get('/api/blogs/5a422aa71b54a676234d17f7').expect(404)
        })
    })
})

describe('POST blog' , () => {

    const newBlog = {
        title: 'Test blog',
        author: 'Tester',
        url: 'https://test.com',
        likes: 6
    }

    test('request goes through', async () => {
        await api.post('/api/blogs').send(newBlog).expect(201).expect('Content-Type', /application\/json/)
    })

    test('adds one to the database', async () => {
        await api.post('/api/blogs').send(newBlog)

        const response = await api.get('/api/blogs')
        assert.strictEqual(response.body.length, helper.initialBlogs.length + 1)
    })

    test('can be found from db after the request', async () => {
        await api.post('/api/blogs').send(newBlog)

        const response = await api.get('/api/blogs')
        const blogs = response.body.map(r => r.title)
        assert(blogs.includes('Test blog'))
    })

    test('likes default to zero', async () => {
        const newBlog = {
            title: 'Test blog',
            author: 'Tester',
            url: 'https://test.com',
        }
        const response = await api.post('/api/blogs').send(newBlog)

        assert.strictEqual(response.body.likes, 0)
    })

    test('without title fails', async () => {
        const newBlog = {
            author: 'Tester',
            url: 'https://test.com'
        }
        await api.post('/api/blogs').send(newBlog).expect(400)
    })

    test('without url fails', async () => {
        const newBlog = {
            title: 'Test blog',
            author: 'Tester',
        }
        await api.post('/api/blogs').send(newBlog).expect(400)
    })
})

describe('DELETE', () => {
    test('a valid id returns 204 and one blog is deleted from db', async () => {
        await api.delete(`/api/blogs/${helper.initialBlogs[3]._id}`).expect(204)
        const response = await api.get('/api/blogs')
        assert.strictEqual(response.body.length, helper.initialBlogs.length - 1)
    })

    test('invalid id returns bad request', async () => {
        await api.delete('/api/blogs/invalid-id').expect(400)
    })
})

describe('PUT', () => {
    const id = helper.initialBlogs[3]._id

    test('with valid info updates the values', async () => {
        const newBlog = {
            title: 'Test blog',
            author: 'Tester',
            url: 'https://test.com',
            likes: 1000
        }
        await api.put(`/api/blogs/${id}`).send(newBlog)

        const response = await api.get(`/api/blogs/${id}`)

        assert.strictEqual(response.body.title, newBlog.title)
        assert.strictEqual(response.body.author, newBlog.author)
        assert.strictEqual(response.body.url, newBlog.url)
        assert.strictEqual(response.body.likes, newBlog.likes)
    })

    test('without title fails', async () => {
        const newBlog = {
            author: 'Tester',
            url: 'https://test.com'
        }
        await api.put(`/api/blogs/${id}`).send(newBlog).expect(400)
    })

    test('without url fails', async () => {
        const newBlog = {
            title: 'Test blog',
            author: 'Tester',
        }
        await api.put(`/api/blogs/${id}`).send(newBlog).expect(400)
    })
})

describe('id', () => {

    test('is named "id" and not "_id"', async () => {
        const response = await api.get('/api/blogs')

        response.body.forEach(blog => {
            assert.strictEqual(blog.id !== undefined, true)
            assert.strictEqual(blog._id, undefined)
        })
    })
})

after(async () => {
    await mongoose.connection.close()
})