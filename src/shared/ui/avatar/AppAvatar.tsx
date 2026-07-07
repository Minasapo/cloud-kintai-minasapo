import type { AvatarProps } from "@mui/material/Avatar";
import Avatar from "@mui/material/Avatar";
import type { SxProps, Theme } from "@mui/material/styles";

type AppAvatarSize = "small" | "medium" | "large";

export type AppAvatarProps = AvatarProps & {
  size?: AppAvatarSize;
};

const avatarSizeSxMap: Record<AppAvatarSize, SxProps<Theme>> = {
  small: { width: 24, height: 24, fontSize: 12 },
  medium: { width: 32, height: 32, fontSize: 12 },
  large: { width: 40, height: 40, fontSize: 14 },
};

export default function AppAvatar(props: AppAvatarProps) {
  const { size = "medium", sx, ...rest } = props;

  return <Avatar {...rest} sx={[avatarSizeSxMap[size], ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]} />;
}