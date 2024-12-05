const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { GraphQLError } = require("graphql");
const User = require("../models/User");

const hashPassword = (password) => bcrypt.hash(password, 8);

const validatePassword = (password, hashedPassword) =>
  bcrypt.compare(password, hashedPassword);

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

const findUserByEmail = (email) => User.findOne({ email });

const findUserById = (id) => User.findById(id);

const throwGraphQLError = (message, code) => {
  throw new GraphQLError(message, { extensions: { code } });
};

module.exports = {
  hashPassword,
  validatePassword,
  generateToken,
  findUserByEmail,
  findUserById,
  throwGraphQLError,
};
