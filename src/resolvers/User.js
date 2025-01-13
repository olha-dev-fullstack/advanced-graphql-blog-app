import getUserId from "../utils/getUserId.js";

const User = {
  posts(parent, args, { prisma }, info) {
    return prisma.post.findMany({
      where: {
        published: true,
        authorId: parent.id,
      },
    });
  },

  email(parent, args, { request }, info) {
    const userId = getUserId(request);

    if (userId && parent.id === userId) {
      return parent.email;
    } else {
      return null;
    }
  },

  comments(parent, args, { prisma }, info) {
    return prisma.comment.findMany({
      where: {
        authorId: parent.id,
      },
    });
  },
};

export { User as default };
