import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private db: DatabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const email: string | undefined = req?.user?.email;
    if (!email) return false;

    // DB role check
    try {
      const user = await this.db.getUserByEmail(email);
      if (user?.role === 'admin') return true;
    } catch {}

    // Fallback allowlist via env
    const allow = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    return allow.includes(email.toLowerCase());
  }
}
