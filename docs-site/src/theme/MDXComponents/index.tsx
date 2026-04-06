import MDXComponents from "@theme-original/MDXComponents";
import Blockquote from "./Blockquote";
import GlossaryTerm from "./GlossaryTerm";
import Pre from "./Pre";
import Table from "./Table";

const components = {
  ...MDXComponents,
  blockquote: Blockquote,
  GlossaryTerm,
  pre: Pre,
  table: Table,
};

export default components;
