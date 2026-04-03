import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class QuestionAnswerFilterDto {
  @IsUUID()
  questionNodeId!: string;

  @IsArray()
  @IsString({ each: true })
  answerValues!: string[];
}

/** Filtros reutilizáveis para agregações e exportação Excel. */
export class ResponseFiltersDto {
  @IsOptional()
  @IsString()
  respondentNameContains?: string;

  @IsOptional()
  @IsArray()
  @IsIn(['in_progress', 'completed', 'abandoned'], { each: true })
  status?: string[];

  @IsOptional()
  @IsString()
  startedAtFrom?: string;

  @IsOptional()
  @IsString()
  startedAtTo?: string;

  @IsOptional()
  @IsString()
  completedAtFrom?: string;

  @IsOptional()
  @IsString()
  completedAtTo?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionAnswerFilterDto)
  questionFilters?: QuestionAnswerFilterDto[];
}

export class ResponseFiltersBodyDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => ResponseFiltersDto)
  filters?: ResponseFiltersDto;
}
