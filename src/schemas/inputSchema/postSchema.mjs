export const postSchema = {
  title: {
    isLength: {
      min: 3,
      max: 40,
      errorMessage: "Title of a post must be 3 to 40 characters",
    },
    isString: {
      errorMessage: "the title of post must be string",
    },
  },
  body: {
    isLength: {
      min: 10,
      max: 1000,
      errorMessage: "The body of a post must be 10 to 1000 charcters",
    },
    isString: {
      errorMessage: "the body of a post must be string",
    },
  },
};
