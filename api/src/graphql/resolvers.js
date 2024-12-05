const {
  hashPassword,
  validatePassword,
  generateToken,
  findUserByEmail,
  findUserById,
  throwGraphQLError,
} = require("../utils/auth");
const User = require("../models/User");

const resolvers = {
  Query: {
    me: async (parent, args, { user }) => {
      if (!user) throwGraphQLError("You must be logged in", "UNAUTHENTICATED");

      const foundUser = await findUserById(user.id);
      if (!foundUser) throwGraphQLError("User not found", "NOT_FOUND");

      return foundUser;
    },
  },
  Mutation: {
    signup: async (parent, { input }) => {
      const { name, email, password, ...optionalFields } = input;

      const existingUser = await findUserByEmail(email);
      if (existingUser) {
        throwGraphQLError("Email is already in use", "BAD_USER_INPUT");
      }

      const hashedPassword = await hashPassword(password);
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        ...optionalFields,
      });

      await newUser.save();
      const token = generateToken(newUser._id);
      return { token, user: newUser };
    },
    login: async (parent, { email, password }) => {
      const user = await findUserByEmail(email);
      if (!user) throwGraphQLError("User not found", "BAD_USER_INPUT");

      const isMatch = await validatePassword(password, user.password);
      if (!isMatch) throwGraphQLError("Wrong password", "BAD_USER_INPUT");

      const token = generateToken(user._id);
      return { token, user };
    },
    updateProfile: async (parent, { input }, { user }) => {
      if (!user) throwGraphQLError("You must be logged in", "UNAUTHENTICATED");

      const { socialLinks, ...otherFields } = input;

      const updateData = { ...otherFields };

      if (socialLinks) {
        Object.keys(socialLinks).forEach((key) => {
          if (socialLinks[key] !== undefined) {
            updateData[`socialLinks.${key}`] = socialLinks[key];
          }
        });
      }

      const updatedUser = await User.findByIdAndUpdate(
        user.id,
        { $set: updateData },
        { new: true }
      );

      if (!updatedUser) throwGraphQLError("User not found", "NOT_FOUND");

      return updatedUser;
    },
  },
};

module.exports = resolvers;
