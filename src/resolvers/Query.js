const Query = {
  users(parent, args, { prisma }, info) {
    if (!args.query) {
      return prisma.user.findMany();
    }
    const { query } = args;
    return prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } }, // Case-insensitive search
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
    });
  },
  posts(parent, args, { prisma }, info) {
    if (!args.query) {
      return prisma.post.findMany();
    }

    const { query } = args;
      return prisma.post.findMany({
        where: {
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
  me() {
    return {
      id: "123098",
      name: "Mike",
      email: "mike@example.com",
    };
  },
  post() {
    return {
      id: "092",
      title: "GraphQL 101",
      body: "",
      published: false,
    };
  },
};
export { Query as default };
