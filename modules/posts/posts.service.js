const {PrismaClient} = require('@prisma/client')
const DI = require('../../lib/DI')
const utils = require('./post.utils')

const DEFAULT_IMAGE_URL = "http://res.cloudinary.com/dts7nyiog/image/upload/v1655124121/users/yylbf1ljyehqigwqaatz.jpg"

const SOCIAL_TAG = {
    me: 'Mine',
    university: 'My university',
    all: 'All'
}

const prisma = new PrismaClient()

const {
    post,
    tag,
    postChunk,
    $transaction,
    likeOnPosts,
    comment,
    likeOnComments,
    postsOnTags,
    user,
} = prisma



class PostsService {
    async getPosts(data) {
        let {
            socialTag,
            take,
            skip,
            filter,
            userId
        } = data

        filter = JSON.parse(filter)

        socialTag ??= SOCIAL_TAG.all

        let SOCIAL_TAG_FILTER;

        if(socialTag === SOCIAL_TAG.all){
            SOCIAL_TAG_FILTER = {}
        }

        if(socialTag === SOCIAL_TAG.me) {
            SOCIAL_TAG_FILTER = {
                user: {
                    id: userId
                }
            }
        }

        if(socialTag === SOCIAL_TAG.university) {
            const userData = await user.findUnique({
                id: userId,
                include: {
                    profile: {
                        include: {
                            group: {
                                include: {
                                    faculty: {
                                        include: {
                                            university: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            })

            const universityName = userData?.profile?.group?.faculty?.university?.name

            SOCIAL_TAG_FILTER = {
                user: {
                    profile: {
                        group: {
                            faculty: {
                                university: {
                                    name: universityName
                                }
                            }
                        }
                    }
                }
            }
        }

        const relatedTags = await tag.findMany({
            where: {
                value: {
                    in: filter?.tags || []
                }
            }
        })

        const tagIds = relatedTags.map(el => el.id)

        const POST_TAGS_FILTER = {
            tags: {
                where:{
                    tagId: {
                        in: tagIds
                    }
                }
            }
        }

        const FILTER_OBJECT = [
            SOCIAL_TAG_FILTER,
            POST_TAGS_FILTER
        ]

        try {
            let data = await post.findMany({
                skip,
                take,
                orderBy: {
                    id: 'desc'
                },
                where: {
                    AND: [
                        SOCIAL_TAG_FILTER,
                        {
                            tags: {
                                every: {
                                    tagId: {
                                        in: tagIds
                                    }
                                }
                            }
                        }
                    ],
                },
                include: {
                    _count:{
                        select: {
                            comments: true
                        }
                    },
                    likes: true,
                    tags: {
                        include: {
                            tag: true
                        }
                    },
                    chunks: true,
                    user: {
                        include: {
                            profile: true
                        }
                    },
                }
            })

            const answer = utils.formatMultiple(data, userId)


            // data = data.map(el => ({...el, tags: el.tags.map(el => el.tag.value)}))
            return answer
        } catch (e) {
            console.log('error', e)
        }
    }

    async getPost({id, userId}) {
        try {
            const data = await post.findMany({
                where: {
                    id,
                },
                include: {
                    user: {
                        include:{

                            profile: true
                        }
                    }
                }
            })

            const foundPost = data[0]

            const relatedChunks = await postChunk.findMany({
                where: {
                    postId: id
                }
            });

            const likeCount = await likeOnPosts.count({
                where: {
                    postId: id
                }
            });

            const isLiked = await likeOnPosts.findMany({
                where: {
                    postId: id,
                    userId
                }
            });

            const relatedTags = await postsOnTags.findMany({
                where: {
                    postId: id
                },
                include:{
                    tag: true
                }
            });

            const relatedComments = await comment.findMany({
                where: {
                    postId: id
                },
                include: {
                    user: {
                        include: {
                            profile: true
                        }
                    },
                    users: true
                }
            });


            const model = utils.formatSinglePost({
                post: foundPost,
                chunks: relatedChunks,
                likeCount,
                isLiked,
                tags: relatedTags,
                comments: relatedComments,
                userId
            })

            return model
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
        const data = bufferImage? await imageStorage.storeImageAndReturnUrl(bufferImage): DEFAULT_IMAGE_URL

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
        await post.updateMany({
            where: {
                id,
                authorId: userId
            },
            data: {
                title
            }
        })

        const imageStorage = DI.injectModule('imageStorage')
        if (chunkPhoto?.length > 0) {
            chunks[0].image = chunkPhoto ? await imageStorage.storeImageAndReturnUrl(chunkPhoto) : ''
        }else {
            const relatedChunks = await postChunk.findMany({where: {postId: id}})
            chunks[0].image = relatedChunks[0]?.image || DEFAULT_IMAGE_URL

        }

        const chunksIds = []

        for await (let chunk of chunks) {
            const updateChunk = {
                text: chunk.text,
            }

            if(chunk.image !== DEFAULT_IMAGE_URL) updateChunk.image = chunk.image

            const createdChunk = await postChunk.upsert({
                where: {postId: id},
                update: {
                    image: chunk.image,
                    text: chunk.text
                },
                create: {
                    image: chunk.image,
                    text: chunk.text,
                    postId: id
                },
            })

            chunksIds.push({id: createdChunk.id})
        }

        await post.update({
            where: {
                id,
                authorId: userId,
                data: {
                    chunks: {
                        connect: chunksIds.map(el => ({id: el.id}))
                    }
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
        return await likeOnPosts.create({
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
        return await likeOnPosts.deleteMany({
            where: {
                postId,
                userId
            }
        })
    }

    async createComment(text, postId, userId) {
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

    async getPostComments(postId){
        const comments = await comment.findMany({
            where: {
                postId: Number(postId)
            },
            include: {
                user: {
                    include: {
                        profile: true
                    }
                },
                users: true
            }
        })

        return utils.formatComments(comments)
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

    async createOrUpdatePost({title, body, userId, tags, imageData, id}){
        try{
            if(id){
                return await this.updatePost({id: Number(id), userId, chunks: [{text: body}], chunkPhoto: imageData, title})
            }else {
                return await this.createPost({title, body: [{text: body}], userId, tags, bufferImage: imageData})
            }
        }catch (e) {
            console.log(e)
        }
    }
}

module.exports = {
    module: {
        service: new PostsService(),
        name: 'postService'
    }
}
