import { GraphQLResult } from "@aws-amplify/api";
import { createDocument } from "@shared/api/graphql/documents/mutations";
import {
  CreateDocumentInput,
  CreateDocumentMutation,
  Document as APIDocument,
} from "@shared/api/graphql/types";
import { API } from "aws-amplify";

export default async function createDocumentData(input: CreateDocumentInput) {
  const response = (await API.graphql({
    query: createDocument,
    variables: { input },
    authMode: "AMAZON_COGNITO_USER_POOLS",
  })) as GraphQLResult<CreateDocumentMutation>;

  if (response.errors) {
    throw new Error(response.errors[0].message);
  }

  if (!response.data?.createDocument) {
    throw new Error("Document not found");
  }

  const document: APIDocument = response.data.createDocument;
  return document;
}
