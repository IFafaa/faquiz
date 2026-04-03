import {
  Body,
  Controller,
  Param,
  Post,
  Req,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { ExportResponsesExcelUseCase } from '../../application/use-cases/analytics/export-responses-excel.use-case.js';
import { GetResponseAggregatesUseCase } from '../../application/use-cases/analytics/get-response-aggregates.use-case.js';
import type { JwtPayloadUser } from '../../infrastructure/auth/jwt.strategy.js';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard.js';
import { ResponseFiltersBodyDto } from '../dtos/response-filters.dto.js';

/**
 * Rotas explícitas (prefixo completo) para evitar ambiguidade no registo de paths
 * aninhados em alguns ambientes / versões do router.
 */
@Controller()
export class QuizInsightsController {
  constructor(
    private readonly getResponseAggregates: GetResponseAggregatesUseCase,
    private readonly exportResponsesExcel: ExportResponsesExcelUseCase,
  ) {}

  @Post('quizzes/:id/analytics/aggregates')
  @UseGuards(JwtAuthGuard)
  responseAggregates(
    @Req() req: Request & { user: JwtPayloadUser },
    @Param('id') id: string,
    @Body() body: ResponseFiltersBodyDto,
  ) {
    return this.getResponseAggregates.execute(id, req.user.sub, body.filters);
  }

  @Post('quizzes/:id/export/responses')
  @UseGuards(JwtAuthGuard)
  async exportResponses(
    @Req() req: Request & { user: JwtPayloadUser },
    @Param('id') id: string,
    @Body() body: ResponseFiltersBodyDto,
  ) {
    const buffer = await this.exportResponsesExcel.execute(
      id,
      req.user.sub,
      body.filters,
    );
    const safeName = `faquiz-${id.slice(0, 8)}-respostas.xlsx`;
    return new StreamableFile(buffer, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      disposition: `attachment; filename="${safeName}"`,
    });
  }
}
