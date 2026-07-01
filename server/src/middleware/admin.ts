import type { Request, Response, NextFunction } from 'express';

const getAdminUsernames = (): string[] => {
  const raw = process.env.ADMIN_USERNAMES || '';
  return raw
    .split(',')
    .map((u) => u.trim().toLowerCase())
    .filter(Boolean);
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const adminUsernames = getAdminUsernames();
  if (!adminUsernames.includes(user.name.toLowerCase())) {
    return res.status(403).json({ message: 'Admin access required' });
  }

  next();
};

export const checkIsAdmin = (username: string): boolean => {
  const adminUsernames = getAdminUsernames();
  return adminUsernames.includes(username.toLowerCase());
};
