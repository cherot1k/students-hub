const {PrismaClient} = require('@prisma/client')
const DI = require('../../lib/DI')

const {post, tag, postChunk, $transaction, likeOnPosts, comment, likeOnComments} = new PrismaClient()

class PostsService {
    async getPosts({filterObject}) {
        try {
            let data = await post.findMany(filterObject)
            data = data.map(el => ({...el, tags: el.tags.map(el => el.tag.value)}))
            return data
        } catch (e) {
            console.log('error', e)
        }
    }

    async getPost({id}) {
        try {
            const data = await post.findMany({
                where: {
                    id,
                },
                include: {
                    chunks: true,
                    user: true,
                }
            })

            return data[0]
        } catch (e) {
            console.log('error', e)
        }
    }

    async getMyPosts({userId}) {
        try {
            const data = await post.findMany({
                where: {
                    authorId: userId
                },
                include: {
                    chunks: true,
                    user: true,
                }
            })

            return data[0]
        } catch (e) {
            console.log('error', e)
        }
    }

    async createPost({title, body, userId, tags, bufferImage}) {

        const imageStorage = DI.injectModule('imageStorage')
        const data = await imageStorage.storeImageAndReturnUrl(bufferImage)

        body = body.map(el => ({...el, image: data}))

        const relatedTags = await tag.findMany({
            where: {
                value: {
                    in: tags
                }
            }
        })

        const tagIds = relatedTags.map(el => el.id)

        try {
            return await post.create({
                data: {
                    title,
                    user: {
                        connect: {
                            id: userId
                        }
                    },
                    chunks: {
                        create: [...body]
                    },
                    tags: {
                        create: tagIds.map(el => ({
                            tag: {
                                connect: {
                                    id: el
                                }
                            }
                        }))
                    }
                },
                include: {
                    chunks: true,
                }
            })
        } catch (e) {
            throw new Error(e)
        }

    }

    async updatePost({id, title, userId, chunks, chunkPhoto}) {
        await post.update({
            where: {
                id,
                authorId: userId
            },
            data: {
                title
            }
        })

        const imageStorage = DI.injectModule('imageStorage')
        if (chunkPhoto) chunks[0].image = chunkPhoto ? await imageStorage.storeImageAndReturnUrl(chunkPhoto) : ''

        const chunksIds = []

        for await (let chunk of chunks) {
            const createdChunk = await postChunk.upsert({
                where: {id: chunks.id},
                update: {
                    image: chunk.image,
                    text: chunk.text
                },
                create: {
                    image: chunk.image,
                    text: chunk.text
                },
            })

            chunksIds.push({id: createdChunk.id})
        }

        await post.update({
            where: {
                id,
                authorId: userId,
                data: {
                    chunks: chunksIds
                }
            }
        })
    }

    async deletePost({id}) {
        try {
            const deletePost = await post.delete({
                where: {
                    id
                }
            })
            const deleteChunks = await postChunk.deleteMany({
                where: {
                    postId: id
                }
            })

            return await $transaction([deletePost, deleteChunks])
        } catch (e) {
            console.log(e)
            throw new Error(e)
        }
    }

    async getTags() {
        const data = await tag.findMany()

        return {
            tags: data.map(el => el.value)
        }
    }

    async likePost(postId, userId) {
        await likeOnPosts.create({
            data: {
                user: {
                    connect: {
                        id: userId
                    }
                },
                post: {
                    connect: {
                        id: postId
                    }
                }
            }
        })
    }

    async unlikePost(postId, userId) {
        await likeOnPosts.deleteMany({
            where: {
                postId,
                userId
            }
        })
    }

    async createComment(text, userId, postId) {
        await post.update({
            where: {
                id: postId
            },
            data: {
                comments: {
                    create: [
                        {
                            text,
                            user: {
                                connect: {
                                    id: userId
                                }
                            }
                        }
                    ]
                }
            }
        })

    }

    async likeComment(commentId, userId) {
        await comment.update({
            where: {
                id: commentId
            },
            data: {
                users: {
                    create: [
                        {
                            user: {
                                connect: {
                                    id: userId
                                }
                            }
                        }
                    ]
                }
            }
        })
    }

    async unlikeComment(userId, commentId) {
        await likeOnComments.deleteMany({
            where: {
                commentId,
                userId
            }
        })
    }
}

module.exports = {
    module: {
        service: new PostsService(),
        name: 'postService'
    }
}
