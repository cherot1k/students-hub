'use strict'
const { PrismaClient } = require('@prisma/client')
const DI = require('../../lib/DI')
const utils = require('./post.utils')
const { DbError } = require('../auth/auth.errors')
const {AuthorizationError, NotAllowedError, ValidationError} = require('./post.errors')

const DEFAULT_IMAGE_URL = 'https://res.cloudinary.com/dts7nyiog/image/upload/v1680441096/post-default_vc9674.jpg'

const SOCIAL_TAG = {
    me: 'Mine',
    university: 'My university',
    all: 'All',
}

const prisma = new PrismaClient()

const {
    post,
    tag,
    postChunk,
    likeOnPosts,
    comment,
    likeOnComments,
    postsOnTags,
    user,
} = prisma

const SWEAR_WORD_REGEX = /(?<=^|[^а-яa-z])(([уyu]|[нзnz3][аa]|(хитро|не)?[вvwb][зz3]?[ыьъi]|[сsc][ьъ']|(и|[рpr][аa4])[зсzs]ъ?|([оo0][тбtb6]|[пp][оo0][дd9])[ьъ']?|(.\B)+?[оаеиeo])?-?([еёe][бb6](?!о[рй])|и[пб][ае][тц]).*?|([нn][иеаaie]|([дпdp]|[вv][еe3][рpr][тt])[оo0]|[рpr][аa][зсzc3]|[з3z]?[аa]|с(ме)?|[оo0]([тt]|дно)?|апч)?-?[хxh][уuy]([яйиеёюuie]|ли(?!ган)).*?|([вvw][зы3z]|(три|два|четыре)жды|(н|[сc][уuy][кk])[аa])?-?[бb6][лl]([яy](?!(х|ш[кн]|мб)[ауеыио]).*?|[еэe][дтdt][ь']?)|([рp][аa][сзc3z]|[знzn][аa]|[соsc]|[вv][ыi]?|[пp]([еe][рpr][еe]|[рrp][оиioеe]|[оo0][дd])|и[зс]ъ?|[аоao][тt])?[пpn][иеёieu][зz3][дd9].*?|([зz3][аa])?[пp][иеieu][дd][аоеaoe]?[рrp](ну.*?|[оаoa][мm]|([аa][сcs])?([иiu]([лl][иiu])?[нщктлtlsn]ь?)?|([оo](ч[еиei])?|[аa][сcs])?[кk]([оo]й)?|[юu][гg])[ауеыauyei]?|[мm][аa][нnh][дd]([ауеыayueiи]([лl]([иi][сзc3щ])?[ауеыauyei])?|[оo][йi]|[аоao][вvwb][оo](ш|sh)[ь']?([e]?[кk][ауеayue])?|юк(ов|[ауи])?)|[мm][уuy][дd6]([яyаиоaiuo0].*?|[еe]?[нhn]([ьюия'uiya]|ей))|мля([тд]ь)?|лять|([нз]а|по)х|м[ао]л[ао]фь([яию]|[её]й))(?=($|[^а-я]))/im

const checkForSwearWord = (message) => {
    return SWEAR_WORD_REGEX.test(message)
}

class PostsService {
    async getPosts(data) {
        let {
            socialTag,
            take,
            skip,
            filter,
            userId,
        } = data

        filter = JSON.parse(filter)

        socialTag ??= SOCIAL_TAG.all

        let SOCIAL_TAG_FILTER

        if (socialTag === SOCIAL_TAG.all) {
            SOCIAL_TAG_FILTER = {}
        }

        if (socialTag === SOCIAL_TAG.me) {
            SOCIAL_TAG_FILTER = {
                user: {
                    id: userId,
                },
            }
        }

        if (socialTag === SOCIAL_TAG.university) {
            const userData = await user.findUnique({
                where: {
                    id: userId,
                },
                include: {
                    profile: {
                        include: {
                            university: true,
                        },
                    },
                },
            })

            const universityName = userData?.profile?.university?.name

            SOCIAL_TAG_FILTER = {
                user: {
                    profile: {
                        university: {
                            name: universityName,
                        },
                        group: null,
                    },
                }
            }
        }

        const relatedTags = await tag.findMany({
            where: {
                value: {
                    in: filter?.tags || [],
                },
            },
        })

        const tagIds = relatedTags.map((el) => el.id)

        const POST_TAGS_FILTER = {
            tags: {
                some: {
                    tagId: {
                        in: tagIds,
                    },
                },
            },
        }

        const FILTER_OBJECT = [
            SOCIAL_TAG_FILTER,
        ]

        if (filter?.tags?.length) FILTER_OBJECT.push(POST_TAGS_FILTER)

        try {
            const data = await post.findMany({
                skip,
                take,
                orderBy: {
                    likes: { _count: 'desc'},
                },
                where: {
                    AND: [
                        ...FILTER_OBJECT,
                        {
                            deleted: null,
                        },
                    ],
                },
                include: {
                    _count: {
                        select: {
                            comments: true,
                        },
                    },
                    likes: true,
                    tags: {
                        include: {
                            tag: true,
                        },
                    },
                    chunks: true,
                    user: {
                        include: {
                            profile: true,
                        },
                    },
                    attachments: true
                },
            })

            const answer = utils.formatMultiple(data, userId)
            return answer
        } catch (e) {
            console.log('error', e)
        }
    }
    async getPost({ id, userId }) {
        try {
            const data = await post.findMany({
                where: {
                    id,
                },
                include: {
                    user: {
                        include: {
                            profile: true,
                        },
                    },
                    attachments: true
                },
            })

            const foundPost = data[0]

            const relatedChunks = await postChunk.findMany({
                where: {
                    postId: id,
                },
            })

            const likeCount = await likeOnPosts.count({
                where: {
                    postId: id,
                },
            })

            const isLiked = await likeOnPosts.findMany({
                where: {
                    postId: id,
                    userId,
                },
            })

            const relatedTags = await postsOnTags.findMany({
                where: {
                    postId: id,
                },
                include: {
                    tag: true,
                },
            })

            const relatedComments = await comment.findMany({
                where: {
                    postId: id,
                },
                include: {
                    user: {
                        include: {
                            profile: true,
                        },
                    },
                    users: true,
                },
            })


            const model = utils.formatSinglePost({
                post: foundPost,
                chunks: relatedChunks,
                likeCount,
                isLiked,
                tags: relatedTags,
                comments: relatedComments,
                userId,
            })

            return model
        } catch (e) {
            console.log('error', e)
        }
    }
    async getMyPosts({ userId }) {
        try {
            const data = await post.findMany({
                where: {
                    authorId: userId,
                },
                include: {
                    chunks: true,
                    user: true,
                },
            })

            return data[0]
        } catch (e) {
            console.log('error', e)
        }
    }
    async createPost({ title, body, userId, tags, bufferImage, attachments }) {

        const imageStorage = DI.injectModule('imageStorage')
        const fileStorage = DI.injectModule('fileStorage')

        if(checkForSwearWord(body)){
            return new ValidationError('No swear words are allowed')
        }

        let attachmentUrls = []

        if(attachments){
           attachmentUrls = await Promise.all(attachments.map(async(el) => {
               const url = await fileStorage.storeFileAndReturnUrl(el.data)
               return {
                   filename: el.filename,
                   extension: el.mimetype,
                   url
               }
           }))
        }

        const data = bufferImage ? await imageStorage.storeImageAndReturnUrl(bufferImage) : DEFAULT_IMAGE_URL

        body = body.map((el) => ({ ...el, image: data }))

        const relatedTags = await tag.findMany({
            where: {
                value: {
                    in: tags,
                },
            },
        })

        const tagIds = relatedTags.map((el) => el.id)

        try {
            return await post.create({
                data: {
                    title,
                    user: {
                        connect: {
                            id: userId,
                        },
                    },
                    chunks: {
                        create: [...body],
                    },
                    tags: {
                        create: tagIds.map((el) => ({
                            tag: {
                                connect: {
                                    id: el,
                                },
                            },
                        })),
                    },
                    attachments: {
                        create: attachmentUrls
                    }
                },
                include: {
                    chunks: true,
                    attachments: true
                },
            })
        } catch (e) {
            throw new Error(e)
        }

    }
    async updatePost({ id, title, userId, chunks, chunkPhoto, tags }) {
        if(tags?.length > 0){
            const relatedTags = await tag.findMany({
                where: {
                    value: {
                        in: tags,
                    },
                },
            })

            const tagIds = relatedTags.map((el) => el.id)

            await postsOnTags.deleteMany({
                where: {
                    postId: id
                }
            })

            await postsOnTags.createMany({
                data: tagIds.map(el => ({
                    tagId: el,
                    postId: id
                }))
            })
        }

        await post.updateMany({
            where: {
                id,
                authorId: userId,
            },
            data: {
                title,
            },
        })

        const imageStorage = DI.injectModule('imageStorage')
        if (chunkPhoto?.length > 0) {
            chunks[0].image =
                chunkPhoto
                    ? await imageStorage.storeImageAndReturnUrl(chunkPhoto)
                    : ''
        } else {
            const relatedChunks = await postChunk.findMany({ where: { postId: id } })
            chunks[0].image = relatedChunks[0]?.image || DEFAULT_IMAGE_URL

        }

        const chunksIds = []

        for await (const chunk of chunks) {
            const updateChunk = {
                text: chunk.text,
            }

            if (chunk.image !== DEFAULT_IMAGE_URL) updateChunk.image = chunk.image

            const createdChunk = await postChunk.upsert({
                where: { postId: id },
                update: {
                    image: chunk.image,
                    text: chunk.text,
                },
                create: {
                    image: chunk.image,
                    text: chunk.text,
                    postId: id,
                },
            })

            chunksIds.push({ id: createdChunk.id })
        }

        await post.update({
            where: {
                id,
            },
            data: {
                chunks: {
                    connect: chunksIds.map((el) => ({ id: el.id })),
                },
            },
        })
    }
    async deletePost({ id, userId }) {
        try {
            return await prisma.$transaction([
                post.updateMany({
                    where: {
                        id,
                        authorId: userId
                    },
                    data: {
                        deleted: new Date(),
                    },
                }),
                postChunk.updateMany({
                    where: {
                        postId: id,
                    },
                    data: {
                        deleted: new Date(),
                    },
                }),
            ])
        } catch (e) {
            console.log(e)
            throw new Error(e)
        }
    }
    async getTags() {
        const data = await tag.findMany()

        return {
            tags: data.map((el) => el.value),
        }
    }
    async likePost(postId, userId) {
        return await likeOnPosts.create({
            data: {
                user: {
                    connect: {
                        id: userId,
                    },
                },
                post: {
                    connect: {
                        id: postId,
                    },
                },
            },
        })
    }
    async unlikePost(postId, userId) {
        return await likeOnPosts.deleteMany({
            where: {
                postId,
                userId,
            },
        })
    }
    async createComment(text, postId, userId) {
        try {
            return await post.update({
                where: {
                    id: postId,
                },
                data: {
                    comments: {
                        create: [
                            {
                                text,
                                user: {
                                    connect: {
                                        id: userId,
                                    },
                                },
                            },
                        ],
                    },
                },
            })

        } catch (e) {
            console.log(e)
            throw new DbError('Can\'t create ')
        }
    }
    async getPostComments(postId, userId) {
        const comments = await comment.findMany({
            where: {
                postId: Number(postId),
            },
            include: {
                user: {
                    include: {
                        profile: true,
                    },
                },
                users: true,
            },
        })

        return utils.formatComments(comments, userId)
    }
    async likeComment({ commentId, userId }) {
        try {
            return await comment.update({
                where: {
                    id: commentId,
                },
                data: {
                    users: {
                        create: [
                            {
                                user: {
                                    connect: {
                                        id: userId,
                                    },
                                },
                            },
                        ],
                    },
                },
            })
        } catch (e) {
            throw new DbError('Liked record already exists')
        }

    }
    async unlikeComment({ userId, commentId }) {
        try {
            return await likeOnComments.deleteMany({
                where: {
                    commentId,
                    userId,
                },
            })
        } catch (e) {
            console.log(e)
            throw new DbError('Can\'t delete liked record')
        }

    }
    async createOrUpdatePost({ title, body, userId, tags, imageData, id, attachments }) {
        if (id) {
            return await this.updatePost({
                id: Number(id),
                userId,
                chunks: [{ text: body }],
                chunkPhoto: imageData,
                title,
                attachments
            })
        } else {
            return await this.createPost({
                title,
                body: [{ text: body }],
                userId,
                tags,
                bufferImage: imageData,
                attachments
            })
        }
    }
    async deletePostAsAdmin({ id, userId, role }){
        if(role !== 'ADMIN') return new AuthorizationError('You are not an admin')

        const userService = DI.injectModule('userService')

        const admin = await userService.getUserById(userId)

        const adminUniversity = admin?.profile?.university?.name;

        const relatedPost = await post.findUnique({
            where: {
                id
            },
            include: {
                chunks: true,
                user: {
                    include:{
                        profile:{
                            include: {
                                university: true
                            }
                        }
                    }
                }
            }
        })

        const authorUniversity = relatedPost?.user?.profile?.university?.name;

        if(adminUniversity !== authorUniversity) throw new NotAllowedError('You can not delete of students not from your university')

        return await prisma.$transaction([
            post.update({
                where: {
                    id,
                },
                data: {
                    deleted: new Date(),
                },
            }),
            postChunk.updateMany({
                where: {
                    postId: id,
                },
                data: {
                    deleted: new Date(),
                },
            }),
        ])

    }
    async createPostAsAdmin({ title, body, userId, tags, bufferImage, attachments, role }){
        if(role !== 'ADMIN') return new AuthorizationError('You are not an admin')

        const imageStorage = DI.injectModule('imageStorage')
        const fileStorage = DI.injectModule('fileStorage')

        let attachmentUrls = []

        if(attachments){
            attachmentUrls = await Promise.all(attachments.map(async(el) => {
                const url = await fileStorage.storeFileAndReturnUrl(el.data)
                return {
                    filename: el.filename,
                    extension: el.mimetype,
                    url
                }
            }))
        }

        const data = bufferImage ? await imageStorage.storeImageAndReturnUrl(bufferImage) : DEFAULT_IMAGE_URL

        body = body.map((el) => ({ ...el, image: data }))

        const relatedTags = await tag.findMany({
            where: {
                value: {
                    in: tags,
                },
            },
        })

        const tagIds = relatedTags.map((el) => el.id)

        try {
            return await post.create({
                data: {
                    title,
                    user: {
                        connect: {
                            id: userId,
                        },
                    },
                    chunks: {
                        create: [...body],
                    },
                    tags: {
                        create: tagIds.map((el) => ({
                            tag: {
                                connect: {
                                    id: el,
                                },
                            },
                        })),
                    },
                    attachments: {
                        create: attachmentUrls
                    }
                },
                include: {
                    chunks: true,
                    attachments: true
                },
            })
        } catch (e) {
            throw new Error(e)
        }


    }
}

module.exports = {
    module: {
        service: new PostsService(),
        name: 'postService',
    },
}
