import jwt, { SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { AuthTokenPayload, AppError } from '../types';
import { userService } from './UserService';
import { userRepository } from '../repositories/UserRepository';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class AuthService {


  private generateToken(payload: AuthTokenPayload): string {
    if (!process.env.JWT_SECRET) {
      throw new AppError('JWT_SECRET não configurado', 500);
    }

    const expString = (process.env.JWT_EXPIRES_IN || '7d') as StringValue;
    const options: SignOptions = {
      expiresIn: expString,
      issuer: 'nodejs-auth-server',
      audience: 'nodejs-auth-client'
    };

    return jwt.sign(payload, process.env.JWT_SECRET || "AJFGOEAAalsdknfi", options);
  }

  async verifyToken(token: string): Promise<AuthTokenPayload> {
    if (!process.env.JWT_SECRET) {
      throw new AppError('JWT_SECRET não configurado', 500);
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as AuthTokenPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError('Token inválido', 401);
      } else if (error instanceof jwt.TokenExpiredError) {
        throw new AppError('Token expirado', 401);
      }
      throw new AppError('Erro ao verificar token', 500);
    }
  }

  async refreshToken(currentToken: string): Promise<string> {
    try {
      const decoded = await this.verifyToken(currentToken);

      // Verificar se o usuário ainda existe
      const user = await userService.getUserById(decoded.id);
      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      // Gerar novo token
      const newPayload: AuthTokenPayload = {
        id: user.id,
        email: user.email,
        name: user.name
      };

      return this.generateToken(newPayload);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao renovar token', 500);
    }
  }

  async authenticateGoogle(tokenId: string): Promise<{ user: AuthTokenPayload; token: string }> {
    if (!process.env.GOOGLE_CLIENT_ID) {
      throw new AppError('GOOGLE_CLIENT_ID não configurado', 500);
    }

    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: tokenId,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();

      if (!payload || !payload.email) {
        throw new AppError('Token Google inválido', 400);
      }

      const { email, name } = payload;

      let user = await userRepository.findByEmail(email);

      if (!user) {
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
        const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(randomPassword, saltRounds);

        user = await userRepository.create({
          name: name || 'Usuário Google',
          email: email,
          password: hashedPassword
        });
      }

      const tokenPayload: AuthTokenPayload = {
        id: user.id,
        email: user.email,
        name: user.name
      };

      const token = this.generateToken(tokenPayload);

      return {
        user: tokenPayload,
        token
      };

    } catch (error) {
      console.error('Erro na autenticação do Google:', error);
      throw new AppError('Falha ao autenticar com o Google', 401);
    }
  }
}

export const authService = new AuthService();