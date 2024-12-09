const { gql } = require("graphql-tag");

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    profilePicture: String
    bio: String
    address: String
    phone: String
    socialLinks: SocialLinks
    role: String!
    isVerified: Boolean!
    createdAt: String!
  }

  type SocialLinks {
    twitter: String
    linkedin: String
    facebook: String
    instagram: String
  }
  input SocialLinksInput {
    twitter: String
    linkedin: String
    facebook: String
    instagram: String
  }

  input SignupInput {
    name: String!
    email: String!
    password: String!
    profilePicture: String
    bio: String
    address: String
    phone: String
    socialLinks: SocialLinksInput
  }

  input UpdateProfileInput {
    name: String
    profilePicture: String
    bio: String
    address: String
    phone: String
    socialLinks: SocialLinksInput
  }

  type AuthPayload {
    token: String
    user: User
  }

  type Query {
    me: User
    users: [User!]!
  }

  type Mutation {
    signup(input: SignupInput!): AuthPayload
    login(email: String!, password: String!): AuthPayload
    updateProfile(input: UpdateProfileInput): User
    deleteUser(id: ID!): User
  }
`;

module.exports = typeDefs;
