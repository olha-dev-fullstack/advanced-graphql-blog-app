# GraphQL Blog Application

This is a GraphQL blog application that enables users to sign up, sign in, create, manage, and publish posts and their accounts.

## 🚀 Features

- **User Authentication**: Secure sign-up and sign-in functionality.
- **Post Management**: Create, update, delete, publish, and unpublish posts.
- **User Profiles**: View user profiles and associated posts. Also manage and delete personal profiles

## 🛠️ Tech Stack

### Backend

- **JavaScript**
- **GraphQL Yoga**
- **Apollo Client**
- **Prisma ORM**
- **PostgreSQL**

## 📜 GraphQL Schema

```javascript
type Query {
  users(query: String, skip: Int, take: Int): [User!]!
  posts(query: String, skip: Int, take: Int, after: ID): [Post!]!
  myPosts(query: String, skip: Int, take: Int): [Post!]!
  comments(skip: Int, take: Int): [Comment!]!
  me: User!
  post(id: ID!): Post!
}

type Mutation {
  createUser(data: CreateUserInput!): AuthPayload!
  deleteUser: User!
  updateUser(data: UpdateUserInput!): User!
  signin(email: String!, password: String!): AuthPayload!
  createPost(data: CreatePostInput!): Post!
  deletePost(id: ID!): Post!
  updatePost(id: ID!, data: UpdatePostInput!): Post!
  createComment(data: CreateCommentInput!): Comment!
  deleteComment(id: ID!): Comment!
  updateComment(id: ID!, data: UpdateCommentInput!): Comment!
}

type Subscription {
  comment(postId: ID!): CommentSubscriptionPayload!
  post: PostSubscriptionPayload!
  myPost: PostSubscriptionPayload!
}

input CreateUserInput {
  name: String!
  email: String!
  password: String!
  age: Int
}

input UpdateUserInput {
  name: String
  email: String
  age: Int
}

input CreatePostInput {
  title: String!
  body: String!
  published: Boolean!
}

input UpdatePostInput {
  title: String
  body: String
  published: Boolean
}

input CreateCommentInput {
  text: String!
  post: ID!
}

input UpdateCommentInput {
  text: String
}

type User {
  id: ID!
  name: String!
  email: String
  age: Int
  password: String!
  posts: [Post!]!
  comments: [Comment!]!
  updatedAt: String!
  createdAt: String!
}

type Post {
  id: ID!
  title: String!
  body: String!
  published: Boolean!
  author: User!
  comments: [Comment!]!
  updatedAt: String!
  createdAt: String!
}

type Comment {
  id: ID!
  text: String!
  author: User!
  post: Post!
  updatedAt: String!
  createdAt: String!
}

enum MutationType {
  CREATED
  UPDATED
  DELETED
}

type AuthPayload {
  user: User!
  token: String!
}

type PostSubscriptionPayload {
  mutation: MutationType!
  data: Post!
}

type CommentSubscriptionPayload {
  mutation: MutationType!
  data: Comment!
}
```

## 📦 Project Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/olha-dev-fullstack/advanced-graphql-blog-app
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure the environment:**
   - Create a `.env` file in a server folder and set your PostgreSQL connection details.
   ```bach
    DATABASE_URL="your connection string here"
    JWT_SECRET='your security string here'
   ```
4. **Run database migrations:**
   ```bash
   npm run migrate:postgres
   ```
5. **Start the server:**
   ```bash
   npm start
   ```

## 🎯 Usage Instructions

- Visit localhost:4000 for accessing GraphQL playground
