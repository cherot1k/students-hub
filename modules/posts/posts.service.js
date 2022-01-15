const {PrismaClient} = require("@prisma/client")

const {post, tag, postChunk, $transaction} = new PrismaClient()

class PostsService{
    async getPost({filterObject}){
        try{
            let data =  await post.findMany(filterObject)
            //TODO tech debt
            data = data.map(el => ({...el, tags : el.tags.map(el => el.tag.value)} ))
            return data
        }catch (e) {
            console.log('error', e)
        }
    }

    async createPost({title, body, userId, tags}){
        try{
            return await post.create({
                data: {
                    title,
                    authorId: userId,
                    chunks: {
                        create: [...body]
                    },
                    tags: {
                        create: tags.map(el => ({
                            tag: {
                                connect: {
                                    id: el
                                }
                            }
                        }))
                    }
                },
                include: {
                    chunks: true
                }
            })
        }catch (e) {
            console.log(e)
            throw new Error(e)
        }

    }

    async updatePost({ id, title }){
        return await post.update({
            where: {
                id
            },
            data: {
                title
            }
        })
    }

    async updateChunks(chunkArray){
        try {
            for(let updatedChunk of chunkArray){
                const dataObject = {}
                if(updatedChunk.image) dataObject.image = updatedChunk.image
                if(updatedChunk.text) dataObject.text = updatedChunk.text
                await postChunk.update({
                    where:{
                        id: updatedChunk.id
                    },
                    data: dataObject
                })
            }
        }catch (e) {
            console.log(e)
            throw new Error(e)
        }
    }

    async deletePost({id}){
        try{
            const deletePost = await post.delete({
                where : {
                    id
                }
            })
            const deleteChunks = await postChunk.deleteMany({
                where: {
                    postId: id
                }
            })

            return await $transaction([deletePost, deleteChunks])
        }catch (e) {
            console.log(e)
            throw new Error(e)
        }
    }

    async deleteChunk({id}){
        try{
            return await postChunk.delete({
                where : {
                    id
                }
            })
        }catch (e) {
            console.log(e)
            throw new Error(e)
        }
    }

    async getTags(){
        return await tag.findMany()
    }
}

module.exports = {
    module: {
        service: new PostsService(),
        name: 'postService'
    }
}
