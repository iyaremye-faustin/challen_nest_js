import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}
  getHealthCheck(): {
    status: string;
    timestamp: string;
    environment: string;
  } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: this.configService.get<string>('node_env') || 'development',
    };
  }

  getAppInfo(): {
    name: string;
    version: string;
    environment: string;
    timestamp: string;
  } {
    return {
      name: this.configService.get<string>('app_name') || 'challenge',
      version: this.configService.get<string>('version') || '0.0.1',
      environment: this.configService.get<string>('node_env') || 'development',
      timestamp: new Date().toISOString(),
    };
  }
}
