import { sendMail } from "@shared/api/graphql/documents/queries";

import * as MESSAGE_CODE from "@/errors";
import { graphqlClient } from "@/lib/amplify/graphqlClient";

export abstract class MailSender {
  protected async send(to: string[], subject: string, body: string) {
    const params = {
      query: sendMail,
      variables: {
        data: {
          to,
          subject,
          body,
        },
      },
    };

    try {
      await graphqlClient.graphql(params);
    } catch {
      throw new Error(MESSAGE_CODE.E00001);
    }
  }

  protected abstract getWorkDate(): string;
  protected abstract getStaffName(): string;
}
