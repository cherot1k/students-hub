const TYPES = {
    single: 'single',
    multiple: 'multiple'
}

module.exports = {
    TYPES,
    formatSinglePost: ({post, chunks, likeCount, isLiked, tags, comments, userId}) => {

        const user = JSON.parse(JSON.stringify(post.user))
        delete post.user

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

        post.username = `${user.profile.first_name} ${user.profile.last_name}`

        post.profilePictureUrl = user.profile.imageUrl

        post.comments = this.formatComments(comments, userId)

        return post
    },

    formatMultiple: (postArray) => {
        const formattedArray = postArray.map(el => {
            let formattedObject;

            const chunk = el.chunks?.[0]
            const userProfile = el?.user?.profile
            const user = el?.user
            const countValues = el?._count
            const likes = el.likes

            formattedObject = {
                text: chunk?.text,
                image: chunk?.image,
                profilePictureUrl: userProfile?.imageUrl,
                username: `${userProfile.first_name + userProfile.last_name}`,
                likesCount: likes.length,
                isLiked: !!(likes.find(el => el.userId === user.id)),
                commentsCount: countValues.comments,
                title: el.title,
                id: el.id,
                createdAt: el.createdAt,
                authorId: user?.id,
                tags: el.tags?.map(el => el?.tag?.value)
            }
            return formattedObject
        })

        return formattedArray

    },
    formatComments: (comments, userId) => {
        return comments.map(el => ({
            comment: el.text,
            id: el.id,
            username: `${el?.user?.profile?.first_name} ${el?.user?.profile?.last_name}`,
            profilePictureUrl: el?.user?.profile?.imageUrl,
            timeStamp: el?.createdAt,
            likeCount: el?.users?.length || 0,
            isLiked: !!el?.users?.find(el => el.userId === userId)
        }))
    }
}
