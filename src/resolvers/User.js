const User = {
    posts(parent, args, { prisma }, info) {
        return prisma.post.findMany({
            where: {
              authorId: parent.id,
            },
          });
    },
    comments(parent, args, { prisma }, info) {
        return prisma.comment.findMany({
            where: {
              authorId: parent.id,
            },
          });
    }
}

export { User as default }