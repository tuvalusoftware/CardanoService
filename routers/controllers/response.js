export const Response = (response, error) => {
  if (response) {
    return {
      code: 0,
      message: "SUCCESS",
      data: response
    }
  } else {
    return {
      code: 1, 
      message: error.message || error.reason || "Something went wrong",
      data: null
    }
  }
};