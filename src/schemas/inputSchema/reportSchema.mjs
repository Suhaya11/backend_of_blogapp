export const reportInputSchema = {
  reason: {
    isString: {
      errorMessage: "reason must be string",
    },
    isLength: {
      max: 100,
      errorMessage: "reason must not exceed 100 caracters limit",
    },
  },
};
