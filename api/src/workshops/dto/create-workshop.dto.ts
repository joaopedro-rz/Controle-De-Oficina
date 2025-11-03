import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsInt, Min, Max } from 'class-validator';

export class CreateWorkshopDto {
  @ApiProperty({ example: 'Oficina de Robótica', description: 'Nome da oficina' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Introdução à robótica com Arduino', description: 'Descrição da oficina' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: true, description: 'Define se a oficina está ativa' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 2, description: 'Dia da semana (0=Domingo ... 6=Sábado)', minimum: 0, maximum: 6 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(6)
  weekday?: number;

  @ApiPropertyOptional({ example: '14:00', description: 'Horário de início (HH:mm)' })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({ example: '16:00', description: 'Horário de término (HH:mm)' })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiPropertyOptional({ example: 20, description: 'Capacidade máxima de participantes' })
  @IsOptional()
  @IsInt()
  capacity?: number;
}
