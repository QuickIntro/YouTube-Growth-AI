import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, finalize, tap, throwError } from 'rxjs';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private db: DatabaseService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    const method: string = req.method;
    const url: string = req.originalUrl || req.url || '';
    const user = req.user || {};
    const email: string | undefined = user.email;
    const userId: string | undefined = user.id;

    // crude service detection from route prefix
    let service: 'ai' | 'youtube' | 'web' = 'web';
    if (url.startsWith('/ai')) service = 'ai';
    else if (url.startsWith('/youtube')) service = 'youtube';

    return next.handle().pipe(
      tap(() => {}),
      catchError((err) => {
        // log on error as well
        const latency = Date.now() - now;
        const status = err?.status || res?.statusCode || 500;
        this.db.getClient().from('request_logs').insert({
          user_id: userId || null,
          user_email: email || null,
          service,
          route: url,
          method,
          status,
          latency_ms: latency,
          error_code: err?.code || err?.name || null,
          meta: err?.response ? JSON.stringify(err.response).slice(0, 2000) : null,
        });
        return throwError(() => err);
      }),
      finalize(() => {
        // success path
        const latency = Date.now() - now;
        const status = res?.statusCode || 200;
        this.db.getClient().from('request_logs').insert({
          user_id: userId || null,
          user_email: email || null,
          service,
          route: url,
          method,
          status,
          latency_ms: latency,
          meta: null,
        });
      }),
    );
  }
}
