export const adminInputSchema = {
  username: {
    isString: {
      errorMessage: "admin username must be string",
    },
    isLength: {
      min: 20,
      max: 100,
      errorMessage: "admin username must be between 20 to 100",
    },
  },
  password: {
    isString: {
      errorMessage: "admin username must be string",
    },

    isLength: {
      min: 20,
      max: 100,
      errorMessage: "admin username must be between 20 to 100",
    },
  },
};
