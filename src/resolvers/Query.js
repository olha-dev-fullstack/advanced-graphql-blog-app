import getUserId from "../utils/getUserId.js";

const Query = {
  users(parent, args, { prisma }, info) {
    if (!args.query) {
      return prisma.user.findMany({
        skip: args.skip,
        take: args.take,
      });
    }
    const { query } = args;
    return prisma.user.findMany({
      skip: args.skip,
      take: args.take, // Case-insensitive search
      where: {
        name: { contains: query, mode: "insensitive" },
      },
    });
  },
  posts(parent, args, { prisma }, info) {
    const { skip, take, after, query } = args;

    const baseOptions = {
      skip,
      take,
      cursor: after ? { id: after } : undefined,
      where: {
        published: true,
        ...(query && {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { body: { contains: query, mode: "insensitive" } },
          ],
        }),
      },
    };

    return prisma.post.findMany(baseOptions);
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
        skip: args.skip,
        take: args.take,
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
      skip: args.skip,
      take: args.take,
    });
  },

  comments(parent, args, { prisma }, info) {
    return prisma.comment.findMany({
      skip: args.skip,
      take: args.take,
    });
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
