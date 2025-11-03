import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsEnum, IsDateString } from 'class-validator';
import { VolunteerStatus } from '../../common/enums/volunteer-status.enum';

export class CreateVolunteerDto {
  @ApiProperty({ example: 'Maria', description: 'Primeiro nome do voluntário' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Souza', description: 'Último nome do voluntário' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'Maria Souza', description: 'Nome completo do voluntário' })
  @IsString()
  fullName: string;

  @ApiPropertyOptional({ example: 'maria@example.com', description: 'E-mail do voluntário' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+55 11 99999-0000', description: 'Telefone para contato' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: '123.456.789-00', description: 'CPF do voluntário' })
  @IsOptional()
  @IsString()
  cpf?: string;

  @ApiPropertyOptional({ example: '1990-05-20', description: 'Data de nascimento (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ example: 'Rua das Flores, 123 - São Paulo/SP', description: 'Endereço completo' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: '2025-01-10', description: 'Data de início no projeto (YYYY-MM-DD)' })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({ example: '2025-12-20', description: 'Data de término no projeto (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: VolunteerStatus.ACTIVE, description: 'Status do voluntário', enum: VolunteerStatus })
  @IsOptional()
  @IsEnum(VolunteerStatus)
  status?: VolunteerStatus;

  @ApiPropertyOptional({ example: 'Ana Souza', description: 'Nome do contato de emergência' })
  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @ApiPropertyOptional({ example: '+55 11 98888-7777', description: 'Telefone do contato de emergência' })
  @IsOptional()
  @IsString()
  emergencyContactPhone?: string;

  @ApiPropertyOptional({ example: 'Prefere atuar em turmas de sábado', description: 'Observações gerais' })
  @IsOptional()
  @IsString()
  notes?: string;
}
