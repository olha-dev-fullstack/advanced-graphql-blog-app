import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const Mutation = {
  async createUser(parent, args, { prisma }, info) {
    const { name, email, age, password } = args.data;

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      throw new Error("Email taken");
    }

    if (password.length < 8) {
      return {
        userErrors: {
          message: "Error must be longer than 8 characters",
        },
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = prisma.user.create({
      data: {
        email,
        name,
        age,
        password: hashedPassword,
      },
    });

    return {
      user,
      token: jwt.sign({ userId: user.id }, "thisisasecret"),
    };
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
  async createPost(parent, args, { prisma, pubsub }, info) {
    const { author: userId, title, body, published } = args.data;
    const userExists = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!userExists) {
      throw new Error("User not found");
    }

    const createdPost = prisma.post.create({
      data: {
        title,
        body,
        published,
        authorId: userId,
      },
    });

    pubsub.publish(`post`, {
      post: {
        mutation: "CREATED",
        data: createdPost,
      },
    });
    return createdPost;
  },
  async deletePost(parent, args, { prisma, pubsub }, info) {
    const { id } = args;

    const postToDelete = await prisma.post.findUnique({
      where: {
        id,
      },
    });
    if (!postToDelete) {
      throw new Error("User not found");
    }

    const deletedPost = prisma.post.delete({ where: { id } });
    pubsub.publish(`post`, {
      post: {
        mutation: "DELETED",
        data: deletedPost,
      },
    });
    return deletedPost;
  },

  async updatePost(parent, args, { prisma, pubsub }, info) {
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
    const updatedPost = prisma.post.update({
      data,
      where: {
        id,
      },
    });

    pubsub.publish(`post`, {
      post: {
        mutation: "UPDATED",
        data: updatedPost,
      },
    });
    return updatedPost;
  },
  async createComment(parent, args, { prisma, pubsub }, info) {
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
    const createdComment = await prisma.comment.create({
      data: {
        text,
        authorId: userId,
        postId: postId,
      },
    });
    pubsub.publish(`comment ${args.data.post}`, {
      comment: {
        mutation: "CREATED",
        data: createdComment,
      },
    });
    return createdComment;
  },
  async deleteComment(parent, args, { prisma, pubsub }, info) {
    const { id } = args;
    const commentToDelete = await prisma.comment.findUnique({ where: { id } });
    if (!commentToDelete) {
      return {
        commentErrors: {
          message: "Cannot find comment to delete",
        },
      };
    }
    const deletedComment = prisma.comment.delete({ where: { id } });
    pubsub.publish(`comment ${args.data.post}`, {
      comment: {
        mutation: "DELETED",
        data: deletedComment,
      },
    });
    return deletedComment;
  },
  async updateComment(parent, args, { prisma, pubsub }, info) {
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
    const updatedComment = prisma.comment.update({
      data,
      where: {
        id,
      },
    });
    pubsub.publish(`comment ${args.data.post}`, {
      comment: {
        mutation: "UPDATED",
        data: updatedComment,
      },
    });
    return updatedComment;
  },
};

export { Mutation as default };
