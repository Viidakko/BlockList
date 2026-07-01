const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const helper = require('./test_helper')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')

const api = supertest(app)

describe('when there is initially one user at db', () => {
    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'root', passwordHash })

        await user.save()
    })

    describe('POST', () => {
        test('creation succeeds with valid information', async () => {
            const usersAtStart = await helper.usersInDb()

            const newUser = {
                username: 'Viidakko',
                name: 'Jaakko Hietikko',
                password: 'salasana1',
            }

            await api
                .post('/api/users')
                .send(newUser)
                .expect(201)
                .expect('Content-Type', /application\/json/)

            const usersAtEnd = await helper.usersInDb()
            assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

            const usernames = usersAtEnd.map(u => u.username)
            assert(usernames.includes(newUser.username))
        })

        test('creation fails with username that is already in use', async () => {
            const usersAtStart = await helper.usersInDb()

            const newUser = {
                username: 'root',
                name: 'Superuser',
                password: 'salainen',
            }

            const result = await api
                .post('/api/users')
                .send(newUser)
                .expect(400)
                .expect('Content-Type', /application\/json/)

            const usersAtEnd = await helper.usersInDb()
            assert(result.body.error.includes('expected `username` to be unique'))

            assert.strictEqual(usersAtEnd.length, usersAtStart.length)
        })

        test('creation fails with no username', async () => {
            const usersAtStart = await helper.usersInDb()
            const newUser = {
                name: 'Jaakko Hietikko',
                password: 'salasana1',
            }

            const result = await api.post('/api/users').send(newUser).expect(400)
            assert.strictEqual(result.body.error, 'User validation failed: username: Path `username` is required.')

            const usersAtEnd = await helper.usersInDb()
            assert.strictEqual(usersAtEnd.length, usersAtStart.length)
        })

        test('creation fails with no password', async () => {
            const usersAtStart = await helper.usersInDb()
            const newUser = {
                username: 'Viidakko',
                name: 'Jaakko Hietikko',
            }

            const result = await api.post('/api/users').send(newUser).expect(400)
            assert.strictEqual(result.body.error, 'password must exist and be at least 3 characters')

            const usersAtEnd = await helper.usersInDb()
            assert.strictEqual(usersAtEnd.length, usersAtStart.length)
        })

        test('creation fails with a too short username', async () => {
            const usersAtStart = await helper.usersInDb()
            const newUser = {
                username: 'Vi',
                name: 'Jaakko Hietikko',
                password: 'salasana1',
            }
            const result = await api.post('/api/users').send(newUser).expect(400)
            assert.strictEqual(result.body.error, 'User validation failed: username: Path `username` (`Vi`, length 2) is shorter than the minimum allowed length (3).')

            const usersAtEnd = await helper.usersInDb()
            assert.strictEqual(usersAtEnd.length, usersAtStart.length)
        })

        test('creation fails with a too short password', async () => {
            const usersAtStart = await helper.usersInDb()
            const newUser = {
                username: 'Viidakko',
                name: 'Jaakko Hietikko',
                password: 'sa',
            }

            const result = await api.post('/api/users').send(newUser).expect(400)
            assert.strictEqual(result.body.error, 'password must exist and be at least 3 characters')

            const usersAtEnd = await helper.usersInDb()
            assert.strictEqual(usersAtEnd.length, usersAtStart.length)
        })
    })
})

after(async () => {
    await mongoose.connection.close()
})