const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const typeDefs = require("./src/graphql/schema");
const resolvers = require("./src/graphql/resolvers");
const jwt = require("jsonwebtoken");
const { json } = require("body-parser");
const cors = require("cors");
// const rateLimit = require("express-rate-limit");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// // Rate limiting to prevent brute force attacks
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
// });
// app.use(limiter);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// JWT authentication middleware
const getUser = (token) => {
  try {
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return { id: decoded.userId }; // Ensure it matches the schema
    }
    return null;
  } catch (err) {
    console.error("Error decoding JWT:", err.message);
    return null;
  }
};

// Create the Apollo server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const user = getUser(token);
    // console.log("Decoded user from token:", user);
    return { user };
  },
});

// Start the Apollo server
server.start().then(() => {
  app.use(
    "/graphql",
    cors(),
    json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const token = req.headers.authorization || "";
        const user = getUser(token.replace("Bearer ", ""));
        return { user };
      },
    })
  );

  app.get("/", (req, res) => {
    res.send("API is working");
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(
      `GraphQL endpoint available at http://localhost:${PORT}/graphql`
    );
  });
});
