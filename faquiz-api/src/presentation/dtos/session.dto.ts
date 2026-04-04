import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class StartSessionDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  respondentName?: string;
}

export class SubmitAnswerDto {
  @IsOptional()
  @IsUUID()
  answerOptionId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  answerValue?: string;
}
