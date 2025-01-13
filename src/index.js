import { GraphQLServer, PubSub } from "graphql-yoga";
import db from "./db.js";
import Query from "./resolvers/Query.js";
import Mutation from "./resolvers/Mutation.js";
import User from "./resolvers/User.js";
import Post from "./resolvers/Post.js";
import Comment from "./resolvers/Comment.js";
import Subscription from "./resolvers/Subscription.js";
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient()
const pubsub = new PubSub()
const server = new GraphQLServer({
  typeDefs: "./src/schema.graphql",
  resolvers: {
    Query,
    Mutation,
    User,
    Post,
    Comment,
    Subscription
  },
  context: {
    db,
    pubsub,
    prisma
  },
});

server.start(() => {
  console.log(`The server is up!`);
});
