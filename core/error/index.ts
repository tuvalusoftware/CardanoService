export * from "./error";

export const parseError = (error: any) => {
  const defaultError: string = "There are some issues with the server, please try again later";
  const response: any = {
    statusText: "FAIL",
    statusCode: error?.statusCode || 500,
    error_code: error?.statusCode || 500,
    message: error?.message || defaultError,
    error_message: error?.message || defaultError,
  };
  if (error?.data) {
    response.data = error?.data;
  }
  return
}

export const parseResult = (result: any) => {
  const response: any = {
    statusText: "OK",
    statusCode: 200,
  };
  if (result) {
    response.data = result;
  }
  return response;
}