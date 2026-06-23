import { JwtService } from '@nestjs/jwt';
export interface JwtPayload {
    sub: string;
    email: string;
    companyId: string;
    roles: string[];
    type: 'access' | 'refresh';
}
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}
export declare class AuthService {
    private readonly jwtService;
    constructor(jwtService: JwtService);
    hashPassword(password: string): Promise<string>;
    comparePassword(password: string, hash: string): Promise<boolean>;
    generateTokens(payload: Omit<JwtPayload, 'type'>): TokenPair;
    verifyToken(token: string): JwtPayload;
    generateRandomToken(length?: number): string;
}
