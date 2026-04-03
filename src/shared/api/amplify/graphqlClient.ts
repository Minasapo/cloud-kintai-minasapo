import type { Client } from "aws-amplify/api";
import { generateClient } from "aws-amplify/api";

let client: Client | undefined;

const getClient = () => {
	client ??= generateClient() as unknown as Client;
	return client;
};

export const graphqlClient: Client = new Proxy({} as Client, {
	get: (_target, prop, receiver) => Reflect.get(getClient(), prop, receiver),
});
