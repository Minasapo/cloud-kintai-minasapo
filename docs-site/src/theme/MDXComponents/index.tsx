import MDXComponents from "@theme-original/MDXComponents";
import Blockquote from "./Blockquote";
import Pre from "./Pre";
import Table from "./Table";

const components = {
  ...MDXComponents,
  blockquote: Blockquote,
  pre: Pre,
  table: Table,
};

export default components;
