import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import getUserId from "../utils/getUserId.js";
import dotenv from "dotenv"

dotenv.config();

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
      throw new Error("Error must be longer than 8 characters");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        age,
        password: hashedPassword,
      },
    });

    return {
      user,
      token: jwt.sign({ userId: user.id }, process.env.JWT_SECRET),
    };
  },
  async deleteUser(parent, args, { prisma, request }, info) {
    const id = getUserId(request);
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
  async updateUser(parent, args, { prisma, request }, info) {
    const id = getUserId(request);
    const { name, email, age } = args.data;

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (!name && !email && !age) {
      throw new Error("Need to have at least one field to update");
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
      data: args.data,
      where: {
        id,
      },
    });
  },
  async signin(parent, { email, password }, { prisma }, info) {
    const userToLogin = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!userToLogin) {
      throw new Error("User with such email is not found");
    }

    const passwordMatch = await bcrypt.compare(password, userToLogin.password);
    if (!passwordMatch) {
      throw new Error("Wrong credentials!");
    }

    return {
      user: userToLogin,
      token: jwt.sign({ userId: userToLogin.id }, process.env.JWT_SECRET),
    };
  },
  async createPost(parent, args, { prisma, pubsub, request }, info) {
    const userId = getUserId(request);
    const { title, body, published } = args.data;
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
  async deletePost(parent, args, { prisma, pubsub, request }, info) {
    const userId = getUserId(request);
    const { id: postId } = args;

    const postToDelete = await prisma.post.findUnique({
      where: {
        id: postId,
        authorId: userId,
      },
    });
    if (!postToDelete) {
      throw new Error("Post not found");
    }

    const deletedPost = await prisma.post.delete({ where: { id: postId } });
    const postSubscriptionUpdate = {
      post: {
        mutation: "DELETED",
        data: deletedPost,
      },
    };
    pubsub.publish(`post`, postSubscriptionUpdate);
    pubsub.publish(`post ${userId}`, postSubscriptionUpdate);
    return deletedPost;
  },

  async updatePost(parent, args, { prisma, pubsub, request }, info) {
    const userId = getUserId(request);
    const { id, data } = args;
    const { title, body, published } = data;
    const post = await prisma.post.findUnique({
      where: {
        id,
        authorId: userId,
      },
    });

    if (!post) {
      throw new Error("Post not found");
    }
    if (!title && !body && !published) {
      throw new Error("Need to have at least one field to update");
    }
    const updatedPost = prisma.post.update({
      data,
      where: {
        id,
      },
    });
    const postSubscriptionUpdate = {
      post: {
        mutation: "UPDATED",
        data: updatedPost,
      },
    };
    pubsub.publish(`post`, postSubscriptionUpdate);
    pubsub.publish(`post ${userId}`, postSubscriptionUpdate);
    return updatedPost;
  },
  async createComment(parent, args, { prisma, pubsub, request }, info) {
    const userId = getUserId(request);
    const { post: postId, text } = args.data;
    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    const postExists = await prisma.post.findUnique({
      where: { id: postId, published: true },
    });

    if (!userExists || !postExists) {
      throw new Error("Unable to find user or post");
    }
    if (!text) {
      throw new Error("No text provided");
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
  async deleteComment(parent, args, { prisma, pubsub, request }, info) {
    const userId = getUserId(request);
    const { id } = args;
    const commentToDelete = await prisma.comment.findUnique({
      where: { id, authorId: userId },
    });
    if (!commentToDelete) {
      throw new Error("Cannot find comment to delete");
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
  async updateComment(parent, args, { prisma, pubsub, request }, info) {
    const userId = getUserId(request);
    const { id, data } = args;
    const { text } = data;
    const commentToUpdate = await prisma.comment.findUnique({
      where: { id, authorId: userId },
    });

    if (!commentToUpdate) {
      throw new Error("Comment not found");
    }

    if (!text) {
      throw new Error("Nothing to update");
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
