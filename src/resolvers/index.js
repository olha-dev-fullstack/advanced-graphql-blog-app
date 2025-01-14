import Query from "./Query.js";
import Mutation from "./Mutation.js";
import User from "./User.js";
import Post from "./Post.js";
import Comment from "./Comment.js";
import Subscription from "./Subscription.js";

const resolvers = {
  Query,
  Mutation,
  Subscription,
  User,
  Post,
  Comment,
};

export default resolvers;
