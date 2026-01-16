import { useAuthenticator } from "@aws-amplify/ui-react";
import { useMemo } from "react";

interface AuthenticatedUser {
  cognitoUserId: string;
}

export default function useAuthenticatedUser(): {
  loading: boolean;
  error: Error | null;
  authenticatedUser: AuthenticatedUser | undefined;
} {
  const { user } = useAuthenticator();

  // Derived state: compute authenticatedUser from user
  const { loading, error, authenticatedUser } = useMemo(() => {
    const cognitoUserId = user?.userId ?? user?.username ?? null;

    if (!cognitoUserId) {
      return {
        loading: false,
        error: new Error("User is not authenticated"),
        authenticatedUser: undefined,
      };
    }

    return {
      loading: false,
      error: null,
      authenticatedUser: {
        cognitoUserId,
      },
    };
  }, [user]);

  return {
    loading,
    error,
    authenticatedUser,
  };
}
