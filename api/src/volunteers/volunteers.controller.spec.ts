import { Test, TestingModule } from '@nestjs/testing';
import { VolunteersController } from './volunteers.controller';
import { VolunteersService } from './volunteers.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { VolunteerStatus } from '../common/enums/volunteer-status.enum';

describe('VolunteersController', () => {
  let controller: VolunteersController;
  let service: VolunteersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VolunteersController],
      providers: [
        {
          provide: VolunteersService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<VolunteersController>(VolunteersController);
    service = module.get<VolunteersService>(VolunteersService);
  });

  it('deve mapear payload snake_case para DTO camelCase no create', async () => {
    const body = {
      full_name: 'Maria Silva',
      email: 'maria@example.com',
      phone: '123',
      cpf: '000.000.000-00',
      birth_date: '1990-01-01',
      address: 'Rua A',
      entry_date: '2024-02-10',
      exit_date: null,
      is_active: true,
      emergency_contact: 'Fulano',
      emergency_phone: '999',
      notes: 'Obs',
    };

    (service.create as jest.Mock).mockResolvedValue({ id: '1', fullName: 'Maria Silva' });

    await controller.create(body as any);

    expect(service.create).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: 'Maria',
        lastName: 'Silva',
        fullName: 'Maria Silva',
        email: 'maria@example.com',
        phone: '123',
        cpf: '000.000.000-00',
        birthDate: '1990-01-01',
        address: 'Rua A',
        startDate: '2024-02-10',
        endDate: undefined,
        status: VolunteerStatus.ACTIVE,
        emergencyContactName: 'Fulano',
        emergencyContactPhone: '999',
        notes: 'Obs',
      }),
    );
  });
});
