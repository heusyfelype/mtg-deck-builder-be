import bcrypt from 'bcrypt';
import { CreateUserDTO, UpdateUserDTO, AppError } from '../types';
import { User } from '../types/user';
import { userRepository } from '../repositories/UserRepository';

class UserService {
  async createUser(userData: CreateUserDTO): Promise<Omit<User, 'password'>> {
    // Verificar se email já existe
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new AppError('Email já está em uso', 409);
    }

    // Criptografar senha
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    // Criar usuário
    const user = await userRepository.create({
      ...userData,
      password: hashedPassword
    });

    // Retornar usuário sem a senha
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getUserById(id: string): Promise<Omit<User, 'password'> | null> {
    const user = await userRepository.findById(id);

    if (!user) {
      return null;
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getAllUsers(): Promise<Omit<User, 'password'>[]> {
    const users = await userRepository.findAll();

    return users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  async updateUser(id: string, userData: UpdateUserDTO): Promise<Omit<User, 'password'> | null> {
    // Verificar se usuário existe
    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      throw new AppError('Usuário não encontrado', 404);
    }

    // Verificar se email já está em uso por outro usuário
    if (userData.email) {
      const emailExists = await userRepository.existsByEmail(userData.email, id);
      if (emailExists) {
        throw new AppError('Email já está em uso', 409);
      }
    }

    // Criptografar nova senha, se fornecida
    if (userData.password) {
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
      userData.password = await bcrypt.hash(userData.password, saltRounds);
    }

    // Atualizar usuário
    const updatedUser = await userRepository.update(id, userData);

    if (!updatedUser) {
      return null;
    }

    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async deleteUser(id: string): Promise<boolean> {
    const userExists = await userRepository.findById(id);
    if (!userExists) {
      throw new AppError('Usuário não encontrado', 404);
    }

    return await userRepository.delete(id);
  }

  async searchUsers(filter: string, page: number = 1, limit: number = 10): Promise<{ users: any[], total: number }> {
    const { users, total } = await userRepository.searchUsers(filter, page, limit);

    return {
      users: users.map((user: any) => ({
        id: user.id || user._id,
        name: user.name,
        email: user.email
      })),
      total
    };
  }
}

export const userService = new UserService();