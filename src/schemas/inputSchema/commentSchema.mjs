export const commentInputSchema = {
  message: {
    isString: {
      errorMessage: "Comment must be string",
    },
    isLength: {
      max: 400,
      min: 4,
      errorMessage: "comment must be between 4 to 400 charcters",
    },
  },

  postId: {
    isLength: {
      min: 23,
      max: 25,
      errorMessage: "The id is 24 characters",
    },
  },
};
