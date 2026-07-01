const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (request, response, next) => {
    const { username, name, password } = request.body

    if (!password || password.length < 3) {
        return response.status(400).send({ error: 'password must exist and be at least 3 characters' }).end()
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
        username,
        name,
        passwordHash,
    })
    try {
        const savedUser = await user.save()
        response.status(201).json(savedUser)
    }
    catch (exception) {
        next(exception)
    }
})

usersRouter.get('/', async (request, response) => {
    const users = await User.find({})
    response.json(users)
})

module.exports = usersRouter