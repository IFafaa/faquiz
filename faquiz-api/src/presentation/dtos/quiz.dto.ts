import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class CreateQuizDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateQuizDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class QuizTreeAnswerOptionDto {
  @IsUUID()
  id!: string;

  @IsString()
  label!: string;

  @IsString()
  value!: string;

  @IsNumber()
  order!: number;

  @ValidateIf((_, v) => v !== null && v !== undefined)
  @IsUUID()
  nextQuestionNodeId?: string | null;
}

export class QuizTreeNodeDto {
  @IsUUID()
  id!: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  questionType!: string;

  @IsNumber()
  positionX!: number;

  @IsNumber()
  positionY!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizTreeAnswerOptionDto)
  answerOptions!: QuizTreeAnswerOptionDto[];
}

export class SaveQuizTreeDto {
  @ValidateIf((_, v) => v !== null && v !== undefined)
  @IsUUID()
  rootNodeId?: string | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizTreeNodeDto)
  nodes!: QuizTreeNodeDto[];
}
