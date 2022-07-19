import { basicInfo } from "./basicInfo";
import { servers } from "./servers"
import { tags } from "./tags";
import { components } from "./components";
import { hash } from "./hash";

const paths = {
  ...hash
};

export const swaggerDocs = {
  ...basicInfo,
  ...servers,
  ...tags,
  ...components,
  ...{ paths: paths },
};