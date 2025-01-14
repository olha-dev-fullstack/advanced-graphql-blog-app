import { GraphQLServer, PubSub } from "graphql-yoga";
import db from "./db.js";
import resolvers from "./resolvers/index.js";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const pubsub = new PubSub();
const server = new GraphQLServer({
  typeDefs: "./src/schema.graphql",
  resolvers: resolvers,
  context: (request) => {
    return {
      db,
      pubsub,
      prisma,
      request,
    };
  }
});

export default server;

