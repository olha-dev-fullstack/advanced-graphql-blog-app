const Comment = {
    author(parent, args, { prisma }, info) {
        return prisma.user.findFirst({
            where: {
                id: parent.authorId
            }
        })
    },
    post(parent, args, { prisma }, info) {
        return prisma.post.findFirst({
            where: {
                id: parent.postId
            }
        })
    }
}

export { Comment as default }