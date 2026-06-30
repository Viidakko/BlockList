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

describe('GET blogs', () => {

    test('returns as json', async () => {
        await api.get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('returns all of the blogs', async () => {
        const response = await api.get('/api/blogs')

        assert.strictEqual(response.body.length, helper.initialBlogs.length)
    })

    test('a specific blog is within the returned blogs', async () => {
        const response = await api.get('/api/blogs')

        const blogs = response.body.map(blog => blog.title)
        assert.strictEqual(blogs.includes('React patterns'), true)
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