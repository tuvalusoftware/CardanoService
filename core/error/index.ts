export * from "./error";

export const parseError = (error: any) => {
  const response: any = {
    statusText: "FAIL",
    statusCode: error?.statusCode || 500,
    message: error?.message || "There are some issues with the server, please try again later"
  };
  if (error?.data) {
    response.data = error?.data;
  }
  return
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