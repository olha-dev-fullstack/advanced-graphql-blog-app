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
};

export default Subscription;
