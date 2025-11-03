import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { UserEntity } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async findAll(
    q?: string,
    page = 1,
    limit = 20,
  ): Promise<{
    items: UserEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const where = q
      ? ({
          name: ILike(`%${q}%`),
        } as import('typeorm').FindOptionsWhere<UserEntity>)
      : ({} as import('typeorm').FindOptionsWhere<UserEntity>);
    const [items, total] = await this.userRepo.findAndCount({
      where,
      take: limit,
      skip: (page - 1) * limit,
      order: { createdAt: 'DESC' },
      select: [
        'id',
        'name',
        'email',
        'isSuperAdmin',
        'createdAt',
        'updatedAt',
        'lastLoginAt',
      ],
    });
    return { items, total, page, limit };
  }

  async findOne(id: string): Promise<UserEntity> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepo.findOne({ where: { email: email.toLowerCase() } });
  }

  async create(dto: CreateUserDto): Promise<UserEntity> {
    const exists = await this.findByEmail(dto.email);
    if (exists) throw new ConflictException('Email already in use');
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      name: dto.name,
      email: dto.email.toLowerCase(),
      passwordHash: hashedPassword,
      isSuperAdmin: dto.isSuperAdmin ?? false,
      lastLoginAt: null,
      refreshToken: null,
    });
    return this.userRepo.save(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.findOne(id);

    if (dto.password) {
      user.passwordHash = await bcrypt.hash(dto.password, 10);
      delete dto.password;
    }

    Object.assign(user, dto);
    return this.userRepo.save(user);
  }

  async remove(id: string): Promise<{ success: boolean }> {
    const result = await this.userRepo.delete(id);
    if (!result.affected) throw new NotFoundException('User not found');
    return { success: true };
  }

  async comparePassword(plain: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(plain, hash);
  }

  // ✅ Salva o refresh token do usuário
  async saveRefreshToken(userId: string, refreshToken: string): Promise<void> {
    await this.userRepo.update({ id: userId }, { refreshToken });
  }

  // ✅ Busca o ID do usuário pelo refresh token
  async findUserIdByRefresh(refreshToken: string): Promise<string | null> {
    const user = await this.userRepo.findOne({ where: { refreshToken } });
    return user ? user.id : null;
  }
}
