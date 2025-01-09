import { Prisma } from "prisma-binding.js";

export const prisma = new Prisma({
    typeDefs: "src/generated/prisma.graphql",
    endpoint: "http://localhost:4000"
});
