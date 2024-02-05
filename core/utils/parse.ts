import { Logger, ILogObj } from "tslog";

const log: Logger<ILogObj> = new Logger();

/* -----------------[ Handler ]----------------- */

export const parseError = (error: any) => {
  log.error("🚨", JSON.stringify(error));
  const defaultError: string =
    "There are some issues with the server, please try again later";
  const response: any = {
    status_text: "Failed",
    error_code: error?.error_code || 500,
    error_message: error?.error_message || defaultError,
  };
  if (error?.data) {
    response.data = error?.data;
  }
  return response;
};

export const parseResult = (result: any) => {
  const response: any = {
    status_text: "Ok",
  };
  if (result) {
    response.data = result;
  }
  return response;
};

/* -----------------[ Others ]----------------- */

export const parseJson = (dummy: any) => {
  if (typeof dummy === "string") {
    return JSON.parse(dummy);
  }
  return dummy;
};

export const parseCapitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
