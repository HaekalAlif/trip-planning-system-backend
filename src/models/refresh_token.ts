export interface RefreshToken {
  id: number;
  jti: string;
  userId: number;
  revoked: boolean;
  expiresAt: Date;
  createdAt: Date;
}
