import getUserId from "../utils/getUserId.js";

const Query = {
  users(parent, args, { prisma }, info) {
    if (!args.query) {
      return prisma.user.findMany();
    }
    const { query } = args;
    return prisma.user.findMany({
      where: {
        name: { contains: query, mode: "insensitive" } }, // Case-insensitive search
 
      
    });
  },
  posts(parent, args, { prisma }, info) {
    if (!args.query) {
      return prisma.post.findMany({
        where: {
          published: true,
        },
      });
    }

    const { query } = args;
    return prisma.post.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: query, mode: "insensitive" } }, // Case-insensitive search
          { body: { contains: query, mode: "insensitive" } },
        ],
      },
    });
  },

  myPosts(parent, args, { request, prisma }, info) {
    const userId = getUserId(request);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    if (!args.query) {
      return prisma.post.findMany({
        where: {
          authorId: userId,
        },
      });
    }
    return prisma.post.findMany({
      where: {
        authorId: userId,
        OR: [
          { title: { contains: query, mode: "insensitive" } }, // Case-insensitive search
          { body: { contains: query, mode: "insensitive" } },
        ],
      },
    });
  },

  comments(parent, args, { prisma }, info) {
    return prisma.comment.findMany();
  },
  me(parent, args, { prisma, request }, info) {
    const userId = getUserId(request);
    return prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
  },
  async post(parent, args, { prisma, request }, info) {
    const userId = getUserId(request, false);

    const post = await prisma.post.findUnique({
      where: {
        id: args.id,
        OR: [
          {
            published: true,
          },
          { authorId: userId },
        ],
      },
    });
    if (!post) {
      throw new Error("Post not found");
    }
    return post;
  },
};
export { Query as default };
