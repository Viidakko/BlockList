const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({})
    response.json(blogs)
})

blogsRouter.post('/', async (request, response, next) => {
    const blog = new Blog(request.body)
    try {
        const savedBlog = await blog.save()
        response.status(201).json(savedBlog)
    } catch (exception) {
        next(exception)
    }
})

blogsRouter.get('/:id', async (request, response, next) => {
    const id = request.params.id
    try {
        const blog = await Blog.findById(id)
        if (blog){
            response.json(blog)
        }
        else {
            response.status(404).end()
        }
    }
    catch (exception) {
        next(exception)
    }
})

blogsRouter.delete('/:id', async (request, response, next) => {
    try {
        await Blog.findByIdAndDelete(request.params.id)
        response.status(204).end()
    }
    catch (exception) {
        next(exception)
    }
})

blogsRouter.put('/:id', async (request, response, next) => {
    const { title, author, url, likes } = request.body

    try {
        const blog = await Blog.findById(request.params.id)
        if (!blog) {
            response.status(404).end()
        }
        blog.title = title
        blog.author = author
        blog.url = url
        blog.likes = likes

        const updatedBlog = await blog.save()
        response.json(updatedBlog)
    }
    catch (exception) {
        next(exception)
    }
})

module.exports = blogsRouter