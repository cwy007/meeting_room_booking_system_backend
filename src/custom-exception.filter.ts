import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class CustomExceptionFilter<T extends HttpException> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    const res = exception.getResponse() as { message: string[] };
    console.error('捕获到异常:', res);

    response.status(status).json({
      code: status,
      message: 'fail',
      data: res.message?.join ? res.message?.join(', ') : exception.message,
    });
  }
}
