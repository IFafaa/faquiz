import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class CreateQuizDto {
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}

export class UpdateQuizDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class QuizTreeAnswerOptionDto {
  @IsUUID()
  id!: string;

  @IsString()
  @MaxLength(500)
  label!: string;

  @IsString()
  @MaxLength(500)
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
  @MaxLength(500)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsString()
  @MaxLength(100)
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
