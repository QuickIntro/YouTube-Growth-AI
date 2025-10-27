import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private databaseService: DatabaseService,
  ) {}

  async validateUser(email: string): Promise<any> {
    return this.databaseService.getUserByEmail(email);
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        role: user.role,
      },
    };
  }

  async googleAuth(googleUser: any) {
    const { email, name, picture, accessToken, refreshToken, googleId } = googleUser;

    let user = await this.databaseService.getUserByEmail(email);

    if (!user) {
      user = await this.databaseService.createUser({
        email,
        name,
        picture,
        access_token: accessToken,
        refresh_token: refreshToken,
        google_id: googleId,
      });
    } else {
      user = await this.databaseService.updateUser(user.id, {
        access_token: accessToken,
        refresh_token: refreshToken,
        name,
        picture,
        google_id: googleId,
      });
    }

    return this.login(user);
  }

  async updateSettings(userId: string, settings: any) {
    return this.databaseService.updateUser(userId, settings);
  }

  async deleteAccount(userId: string) {
    const db = this.databaseService.getClient();
    
    // Delete user and all related data (cascade)
    const { error } = await db.from('users').delete().eq('id', userId);

    if (error) throw error;
    return { success: true };
  }

  async getProfileByEmail(email: string) {
    const user = await this.databaseService.getUserByEmail(email);
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  async revokeGoogleTokens(email: string) {
    const db = this.databaseService.getClient();
    const user = await this.databaseService.getUserByEmail(email);
    if (!user) return { success: true };

    const token = user.access_token || user.refresh_token;
    if (token) {
      try {
        await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(token)}`, {
          method: 'POST',
          headers: { 'Content-type': 'application/x-www-form-urlencoded' },
        });
      } catch {}
    }

    // Clear tokens and scopes in DB
    await this.databaseService.updateUser(user.id, {
      access_token: null,
      refresh_token: null,
      token_expires_at: null,
      granted_scopes: null,
    });

    // Audit (best-effort)
    try {
      await db.from('youtube_scope_grants').insert({ user_id: user.id, scopes: user.granted_scopes || '', event: 'revoke' });
    } catch {}

    return { success: true };
  }
}
