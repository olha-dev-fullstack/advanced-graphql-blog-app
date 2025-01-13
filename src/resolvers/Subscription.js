import getUserId from "../utils/getUserId.js";

const Subscription = {
  comment: {
    async subscribe(parent, { postId }, { prisma, pubsub }, info) {
      const post = await prisma.post.findUnique({where: {id: postId}})
      if (!post) {
        throw new Error("Post not found");
      }

      return pubsub.asyncIterator(`comment ${postId}`);
    },
  },
  post: {
    subscribe(parent, args, { pubsub }, info) {
      return pubsub.asyncIterator("post");
    },
  },
  myPost: {
    subscribe(parent, args, {prisma, request}, info) {
      const userId = getUserId(request);
      return pubsub.asyncIterator(`post ${userId}`)
    }
  }
};

export default Subscription;
