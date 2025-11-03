import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsDateString, IsOptional, IsEnum, IsNumber, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ParticipationRole } from '../../common/enums/participation-role.enum';

export class CreateParticipationDto {
  @ApiProperty({ example: '8d1d7f92-3a3d-4c3d-9a9b-1234567890ab', description: 'UUID do voluntário' })
  @IsUUID()
  volunteerId: string;

  @ApiProperty({ example: '5b3e0c7f-2a1b-4d9c-8e7f-abcdef123456', description: 'UUID da oficina' })
  @IsUUID()
  workshopId: string;

  @ApiProperty({ example: '2025-11-03', description: 'Data da participação (YYYY-MM-DD)' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: ParticipationRole.ASSISTANT, description: 'Papel na participação', enum: ParticipationRole })
  @IsOptional()
  @IsEnum(ParticipationRole)
  role?: ParticipationRole;

  @ApiPropertyOptional({ example: 2, description: 'Horas dedicadas na participação' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  hours?: number;

  @ApiPropertyOptional({ example: 'Apoio na turma iniciante', description: 'Observações' })
  @IsOptional()
  @IsString()
  notes?: string;
}
