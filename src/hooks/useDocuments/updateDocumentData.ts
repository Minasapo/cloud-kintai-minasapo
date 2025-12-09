import { GraphQLResult } from "@aws-amplify/api";
import { updateDocument } from "@shared/api/graphql/documents/mutations";
import {
  Document as APIDocument,
  UpdateDocumentInput,
  UpdateDocumentMutation,
} from "@shared/api/graphql/types";
import { API } from "aws-amplify";

export default async function updateDocumentData(input: UpdateDocumentInput) {
  const response = (await API.graphql({
    query: updateDocument,
    variables: { input },
    authMode: "AMAZON_COGNITO_USER_POOLS",
  })) as GraphQLResult<UpdateDocumentMutation>;

  if (response.errors) {
    throw new Error(response.errors[0].message);
  }

  if (!response.data?.updateDocument) {
    throw new Error("Document not found");
  }

  const document: APIDocument = response.data.updateDocument;
  return document;
}
