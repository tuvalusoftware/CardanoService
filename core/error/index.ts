export * from "./error";

export const parseError = (error: any) => {
  const defaultError: string = "There are some issues with the server, please try again later";
  const response: any = {
    status_text: "FAIL",
    error_code: error?.error_code || 500,
    error_message: error?.message || defaultError,
  };
  if (error?.data) {
    response.data = error?.data;
  }
  return response;
}

export const parseResult = (result: any) => {
  const response: any = {
    status_text: "OK",
  };
  if (result) {
    response.data = result;
  }
  return response;
}