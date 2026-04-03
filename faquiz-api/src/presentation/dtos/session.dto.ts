import { IsOptional, IsString, IsUUID } from 'class-validator';

export class StartSessionDto {
  @IsOptional()
  @IsString()
  respondentName?: string;
}

export class SubmitAnswerDto {
  @IsOptional()
  @IsUUID()
  answerOptionId?: string | null;

  @IsOptional()
  @IsString()
  answerValue?: string;
}
