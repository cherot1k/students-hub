const TYPES = {
    single: 'single',
    multiple: 'multiple'
}

module.exports = {
    TYPES,
    format: ({post, chunks, likeCount, isLiked, tags, comments, userId}) => {

        const chunk = chunks[0]

        if(chunk){
            post = {
                ...post,
                image: chunk.image,
                text: chunk.text
            }
        }

        post.tags = tags?.map(el => el.tag.value)

        post.likesCount = likeCount

        post.isLiked = isLiked.length === 1

        // if(type === TYPES.single){
        //     post.commentsCount = comments.length
        // }else{
        console.log('comments', comments)
            post.comments = comments.map(el => ({
                comment: el.text,
                id: el.id,
                username: `${el?.user?.profile?.first_name} ${el?.user?.profile?.last_name}`,
                profilePictureUrl: el?.user?.profile?.imageUrl,
                timeStamp: el?.createdAt,
                likeCount: el?.users?.length || 0,
                isLiked: !!el?.users?.find(el => el.userId === userId)
            }))
        // }


        return post
    }
}
