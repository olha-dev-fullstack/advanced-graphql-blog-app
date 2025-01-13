const Post = {
    author(parent, args, { prisma }, info) {
        return prisma.user.findFirst({
            where: {
              id: parent.authorId,
            },
          });
    },
    comments(parent, args, { prisma }, info) {
        return prisma.comment.findFirst({
            where: {
              id: parent.authorId,
            },
          });
    }
}

export { Post as default }