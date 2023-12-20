import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, throwError } from 'rxjs';
import * as fs from 'fs';

@Injectable()
export class FileCleanupInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        const request = context.switchToHttp().getRequest();
        if (request.file && request.file.path) {
          fs.unlink(request.file.path, (unlinkErr) => {
            if (unlinkErr) {
              console.error('Erro ao excluir arquivo temporário:', unlinkErr);
            }
          });
        }
        return throwError(err);
      }),
    );
  }
}
