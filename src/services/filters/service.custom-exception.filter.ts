import {
  HttpStatus,
  ArgumentsHost,
  ExceptionFilter,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
  UnprocessableEntityException,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';

export class CustomExceptionFilterService implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    let status = exception.getStatus();
    let msg = exception.message;

    if (
      !exception.response &&
      exception instanceof UnprocessableEntityException
    ) {
      status = HttpStatus.UNPROCESSABLE_ENTITY;
      msg = 'Erro de validação! Verifique os dados enviados!';
    } else if (exception instanceof BadRequestException) {
      status = HttpStatus.BAD_REQUEST;
      msg = 'Erro de validação! Verifique os dados enviados!';
    } else if (exception instanceof UnauthorizedException) {
      status = HttpStatus.UNAUTHORIZED;
      msg = 'Deve estar logado para usar esse recurso!';
    } else if (!exception.response && exception instanceof ForbiddenException) {
      status = HttpStatus.FORBIDDEN;
      msg = 'Sem permissão para acessar este recurso!';
    } else if (exception instanceof NotFoundException) {
      status = HttpStatus.NOT_FOUND;
      msg = 'Serviço não encontrado.';
    }

    response.status(status).json({
      statusCode: status,
      msg: msg,
    });
  }
}
