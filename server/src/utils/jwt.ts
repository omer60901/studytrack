import jwt from 'jsonwebtoken';

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET is required in production');
    }
    return 'studytrack_dev_secret';
  }
  return secret;
};

export const signToken = (id: string) => {
  return jwt.sign({ id }, getJwtSecret(), { expiresIn: '7d' });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, getJwtSecret());
};

export default getJwtSecret;
