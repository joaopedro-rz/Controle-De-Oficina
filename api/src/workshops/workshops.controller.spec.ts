import { Test, TestingModule } from '@nestjs/testing';
import { WorkshopsController } from './workshops.controller';
import { WorkshopsService } from './workshops.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

describe('WorkshopsController', () => {
  let controller: WorkshopsController;
  let service: WorkshopsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkshopsController],
      providers: [
        {
          provide: WorkshopsService,
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

    controller = module.get<WorkshopsController>(WorkshopsController);
    service = module.get<WorkshopsService>(WorkshopsService);
  });

  it('deve mapear is_active e anexar schedule/location na description ao criar', async () => {
    const body = {
      name: 'Robótica',
      description: 'Intro',
      is_active: false,
      schedule: 'Ter 14-16h',
      location: 'Sala 2',
    };

    (service.create as jest.Mock).mockResolvedValue({ id: '1' });

    await controller.create(body as any);

    expect(service.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Robótica',
        isActive: false,
        description: expect.stringContaining('Intro'),
      }),
    );
    const arg = (service.create as jest.Mock).mock.calls[0][0];
    expect(arg.description).toContain('Horário: Ter 14-16h');
    expect(arg.description).toContain('Local: Sala 2');
  });
});
