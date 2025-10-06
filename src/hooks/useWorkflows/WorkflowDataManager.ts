import { GraphQLResult } from "@aws-amplify/api";
import { API } from "aws-amplify";

import {
  CreateWorkflowInput,
  CreateWorkflowMutation,
  DeleteWorkflowInput,
  DeleteWorkflowMutation,
  ListWorkflowsQuery,
  UpdateWorkflowInput,
  UpdateWorkflowMutation,
  Workflow,
} from "@/API";
import {
  createWorkflow,
  deleteWorkflow,
  updateWorkflow,
} from "@/graphql/mutations";
import { listWorkflows } from "@/graphql/queries";

export class WorkflowDataManager {
  async list() {
    const response = (await API.graphql({
      query: listWorkflows,
      authMode: "AMAZON_COGNITO_USER_POOLS",
    })) as GraphQLResult<ListWorkflowsQuery>;

    if (response.errors) {
      throw new Error(response.errors[0].message);
    }

    const items: Workflow[] =
      response.data?.listWorkflows?.items.filter(
        (item): item is NonNullable<typeof item> => !!item
      ) || [];

    return items;
  }

  async create(input: CreateWorkflowInput) {
    const response = (await API.graphql({
      query: createWorkflow,
      variables: { input },
      authMode: "AMAZON_COGNITO_USER_POOLS",
    })) as GraphQLResult<CreateWorkflowMutation>;

    if (response.errors) {
      throw new Error(response.errors[0].message);
    }

    if (!response.data?.createWorkflow) {
      throw new Error("Failed to create workflow");
    }

    return response.data.createWorkflow;
  }

  async update(input: UpdateWorkflowInput) {
    const response = (await API.graphql({
      query: updateWorkflow,
      variables: { input },
      authMode: "AMAZON_COGNITO_USER_POOLS",
    })) as GraphQLResult<UpdateWorkflowMutation>;

    if (response.errors) {
      throw new Error(response.errors[0].message);
    }

    if (!response.data?.updateWorkflow) {
      throw new Error("Failed to update workflow");
    }

    return response.data.updateWorkflow;
  }

  async delete(input: DeleteWorkflowInput) {
    const response = (await API.graphql({
      query: deleteWorkflow,
      variables: { input },
      authMode: "AMAZON_COGNITO_USER_POOLS",
    })) as GraphQLResult<DeleteWorkflowMutation>;

    if (response.errors) {
      throw new Error(response.errors[0].message);
    }

    if (!response.data?.deleteWorkflow) {
      throw new Error("Failed to delete workflow");
    }

    return response.data.deleteWorkflow;
  }
}
