export const notificationInputSchema = {
  title: {
    isString: {
      errorMessage: "title must be string",
    },
    isLength: {
      min: 3,
      max: 30,
      errorMessage: "title must be 3 to 30 charcters",
    },
  },
  content: {
    isString: {
      errorMessage: "title must be string",
    },
    isLength: {
      min: 10,
      errorMessage: "notification content must be atleass 10 charcters",
    },
  },
};
