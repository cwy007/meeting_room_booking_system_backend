import 'express'

interface JwtPayload {
  userId: number;
  username: string;
  roles: string[];
  permissions: {
    id: number;
    code: string;
    description: string;
  }[];
}

declare global {
  namespace Express {
    export interface Request {
      user?: JwtPayload; // 可以根据实际情况定义用户对象的类型
    }
  }
}