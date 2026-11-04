import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/guards/permission-guard/require-permissions.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get('health')
  getHealthCheck() {
    return this.appService.getHealthCheck();
  }

  @Public()
  @Get('info')
  getAppInfo() {
    return this.appService.getAppInfo();
  }
}
