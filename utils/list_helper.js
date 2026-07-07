const dummy = (blogs) => {
    blogs.forEach((blog) => {
        console.log(blog)
    })
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
    if (blogs.length === 0) {
        return null
    }
    return blogs.reduce((favorite, blog) => (blog.likes > favorite.likes ? blog : favorite))
}

const mostBlogs = (blogs) => {
    if (blogs.length === 0) {
        return null
    }
    const blogCounts = blogs.reduce((counts, blog) => {
        counts[blog.author] = (counts[blog.author] || 0) + 1
        return counts
    }, {})
    const maxBlogs = Math.max(...Object.values(blogCounts))
    const author = Object.keys(blogCounts).find((key) => blogCounts[key] === maxBlogs)
    return { author: author, blogs: maxBlogs }
}

const mostLikes = (blogs) => {
    if (blogs.length === 0) {
        return null
    }
    const likeCounts = blogs.reduce((counts, blog) => {
        counts[blog.author] = (counts[blog.author] || 0) + blog.likes
        return counts
    }, {})
    const maxLikes = Math.max(...Object.values(likeCounts))
    const author = Object.keys(likeCounts).find((key) => likeCounts[key] === maxLikes)
    return { author: author, likes: maxLikes }
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}