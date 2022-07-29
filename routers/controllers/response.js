const Resolve = (message) => {
  try {
    const result = message.toUpperCase().split(" ").join("_");
    return result;
  } catch (error) {
    return message;
  }
};

export const Response = (response, error) => {
  if (response) {
    return {
      code: 0,
      message: "SUCCESS",
      data: response
    }
  } else {
    console.log(11111, error);
    return {
      code: 1, 
      message: Resolve(error.message) || Resolve(error.reason) 
        || (typeof error === "string" && error.search("/") === -1 ? Resolve(error) : Resolve("Something went wrong !")),
      data: error.data || null,
    }
  }
};