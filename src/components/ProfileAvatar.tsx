import Avatar from '@mui/material/Avatar';

interface Props {
  avatarUrl: string | null | undefined;
  initials: string;
  size?: number;
  onClick?: () => void;
}

export default function ProfileAvatar({ avatarUrl, initials, size = 36, onClick }: Props) {
  const sx = {
    width: size,
    height: size,
    fontSize: size * 0.38,
    fontWeight: 700,
    cursor: onClick ? 'pointer' : 'default',
  };

  if (avatarUrl?.startsWith('preset:')) {
    const emoji = avatarUrl.replace('preset:', '');
    return (
      <Avatar onClick={onClick} sx={{ ...sx, bgcolor: '#95C11F', fontSize: size * 0.5 }}>
        {emoji}
      </Avatar>
    );
  }

  if (avatarUrl) {
    return <Avatar src={avatarUrl} onClick={onClick} sx={sx} />;
  }

  return (
    <Avatar onClick={onClick} sx={{ ...sx, bgcolor: '#95C11F', color: '#1A3545' }}>
      {initials}
    </Avatar>
  );
}
