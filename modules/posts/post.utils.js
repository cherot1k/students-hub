export default {
    format: (postObject) => {
        let post = JSON.parse(JSON.stringify(postObject))

        const chunk = post.chunks[0]

        if(chunk){
            post = {
                ...post,
                image: chunk.image,
                text: chunk.text
            }

            delete post.chunks
        }

        post.tags = post?.tags?.map(el => el.tag.value)

        post.likesCount = post?._count?.likes


        return post
    }
}
