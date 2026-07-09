interface RequireAuthProps {
  children: JSX.Element;
}

async function RequireAuth({
  children,
}: RequireAuthProps): Promise<JSX.Element> {
  return children;
}
export default RequireAuth;
