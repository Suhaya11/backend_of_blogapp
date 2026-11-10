export const AdduserSchema = {
  username: {
    isString: {
      errorMessage: "username must be string",
    },
    isLength: {
      min: 3,
      max: 20,
      errorMessage: "username must be between 3 to 20 characters",
    },
  },
  password: {
    isLength: {
      min: 6,
      errorMessage: "Password must be atleast 6 characters length",
    },
  },
  email: {
    isLength: {
      min: 10,
      max: 100,
      errorMessage: "Email must be between 10 and 100 charcters",
    },
    isEmail: {
      errorMessage: "invalid email address",
    },
  },
};
