export * from "./error";

export const parseError = (error: any) => {
  return {
    statusText: "FAIL",
    statusCode: error?.statusCode || 500,
    message: error?.message || "There are some issues with the server, please try again later"
  };
}

export const parseResult = (result: any) => {
  const response: any = {
    statusText: "OK",
    statusCode: 200
  };
  if (result) {
    response.data = result;
  }
  return response;
}