const Mutation = {
  async createUser(parent, args, { prisma }, info) {
    const { name, email, age } = args.data;

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      throw new Error("Email taken");
    }

    return prisma.user.create({
      data: {
        email,
        name,
        age,
      },
    });
  },
  async deleteUser(parent, args, { prisma }, info) {
    const { id } = args;
    const userToDelete = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    if (!userToDelete) {
      throw new Error("User not found");
    }

    return prisma.user.delete({ where: { id } });
  },
  async updateUser(parent, args, { prisma }, info) {
    const { id, data } = args;
    const { name, email, age } = data;

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (!name && !email && !age) {
      return {
        userErrors: [
          {
            message: "Need to have at least one field to update",
          },
        ],
        post: null,
      };
    }

    if (email) {
      const userWithEmailTaken = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (userWithEmailTaken) {
        throw new Error("Email taken");
      }
    }
    return prisma.user.update({
      data,
      where: {
        id,
      },
    });
  },
  async createPost(parent, args, { prisma }, info) {
    const { author: userId, title, body, published } = args.data;
    const userExists = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!userExists) {
      throw new Error("User not found");
    }

    return prisma.post.create({
      data: {
        title,
        body,
        published,
        authorId: userId,
      },
    });
  },
  async deletePost(parent, args, { prisma }, info) {
    const { id } = args;

    const postToDelete = await prisma.post.findUnique({
      where: {
        id,
      },
    });
    if (!postToDelete) {
      throw new Error("User not found");
    }

    return prisma.post.delete({ where: { id } });
  },

  async updatePost(parent, args, { prisma }, info) {
    const { id, data } = args;
    const { title, body, published } = data;
    const post = await prisma.post.findUnique({
      where: {
        id,
      },
    });

    if (!post) {
      throw new Error("Post not found");
    }
    if (!title && !body && !published) {
      return {
        postErrors: [
          {
            message: "Need to have at least one field to update",
          },
        ],
        post: null,
      };
    }

    return prisma.post.update({
      data,
      where: {
        id,
      },
    });
  },
  async createComment(parent, args, { prisma }, info) {
    const { author: userId, post: postId, text } = args.data;
    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    const postExists = await prisma.post.findUnique({ where: { id: postId } });

    console.log(userExists);
    console.log(postExists);

    if (!userExists || !postExists) {
      console.log(123);

      return {
        commentErrors: {
          message: "Unable to find user or post",
        },
      };
    }
    if (!text) {
      return {
        commentErrors: {
          message: "No text provided",
        },
      };
    }

    return prisma.comment.create({
      data: {
        text,
        authorId: userId,
        postId: postId,
      },
    });
  },
  async deleteComment(parent, args, { prisma }, info) {
    const { id } = args;
    const commentToDelete = await prisma.comment.findUnique({ where: { id } });
    if (!commentToDelete) {
      return {
        commentErrors: {
          message: "Cannot find comment to delete",
        },
      };
    }

    return prisma.comment.delete({ where: { id } });
  },
  async updateComment(parent, args, { prisma }, info) {
    const { id, data } = args;
    const { text } = data;
    const commentToUpdate = await prisma.comment.findUnique({ where: { id } });

    if (!commentToUpdate) {
      return {
        commentErrors: {
          message: "Comment not found",
        },
      };
    }

    if (!text) {
      return {
        commentErrors: {
          message: "Nothing to update",
        },
      };
    }
    return prisma.comment.update({
      data,
      where: {
        id,
      },
    });
  },
};

export { Mutation as default };
