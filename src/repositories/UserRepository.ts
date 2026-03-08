import { CreateUserDTO, UpdateUserDTO } from '../types';
import UserModel from '../models/User';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../types/user';

// Simulando um banco de dados em memória
// Em produção, usar um ORM como Prisma, TypeORM ou MongoDB
class UserRepository {
  async create(userData: CreateUserDTO): Promise<User> {
    const user: User = {
      id: uuidv4(),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return await UserModel.create(user);
  }

  async findById(id: string): Promise<User | null> {
    return await UserModel.findById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await UserModel.findOne({ email });
  }

  async findAll(): Promise<User[]> {
    return await UserModel.find();
  }

  async update(id: string, userData: UpdateUserDTO): Promise<User | null> {
    const user = await UserModel.findById(id);

    if (!user) {
      return null;
    }

    await UserModel.updateOne({ _id: id }, { $set: userData });

    return await UserModel.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const user = await UserModel.findById(id);

    if (!user) {
      return false;
    }

    await UserModel.deleteOne({ _id: id });
    return true;
  }

  async existsByEmail(email: string, _excludeId?: string): Promise<boolean> {
    return (await UserModel.exists({ email })) !== null;
  }

  async searchUsers(filter: string, page: number = 1, limit: number = 10): Promise<{ users: User[], total: number }> {
    const skip = (page - 1) * limit;
    const query = filter
      ? {
        $or: [
          { name: { $regex: filter, $options: 'i' } },
          { email: { $regex: filter, $options: 'i' } }
        ]
      }
      : {};

    const [users, total] = await Promise.all([
      UserModel.find(query)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      UserModel.countDocuments(query)
    ]);

    return { users: users as unknown as User[], total };
  }
}

export const userRepository = new UserRepository();