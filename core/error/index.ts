export * from "./error";

import { Logger, ILogObj } from "tslog";
const log: Logger<ILogObj> = new Logger();

export const parseError = (error: any) => {
  log.error(JSON.stringify(error));
  const defaultError: string = "There are some issues with the server, please try again later";
  const response: any = {
    status_text: "FAIL",
    error_code: error?.error_code || 500,
    error_message: error?.error_message || defaultError,
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