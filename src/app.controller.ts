import { Controller, Get, SetMetadata } from '@nestjs/common';
import { AppService } from './app.service';
import { RequireLogin, RequirePermissions, UserInfo } from './custom.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('aaa')
  @RequireLogin()
  @RequirePermissions('ccc')
  getAaa(@UserInfo() user: any, @UserInfo('username') username: string): string {
    console.log(user);
    console.log(username);
    return 'aaa';
  }

  @Get('bbb')
  getBbb(@UserInfo() user: any): string {
    console.log(user);
    return 'bbb';
  }
}
