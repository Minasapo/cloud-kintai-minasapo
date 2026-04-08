import Link from "@docusaurus/Link";
import Heading from "@theme/Heading";
import type { JSX } from "react";

import type { GuidePageContent } from "../data/roleGuides";
import { toDocPath } from "../data/roleGuides";

type Props = {
  page: GuidePageContent;
};

export default function RoleGuidePage({ page }: Props): JSX.Element {
  return (
    <>
      <p>{page.intro}</p>
      {page.relatedGuide ? (
        <p>
          {page.relatedGuide.prefix}
          <Link to={toDocPath(page.relatedGuide.link.docId)}>
            {page.relatedGuide.link.label}
          </Link>
          {page.relatedGuide.suffix}
        </p>
      ) : null}
      {page.sections.map((section) => (
        <section key={section.title}>
          <Heading as="h2">{section.title}</Heading>
          <ul>
            {section.links.map((link) => (
              <li key={`${section.title}:${link.docId}`}>
                <Link to={toDocPath(link.docId)}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
