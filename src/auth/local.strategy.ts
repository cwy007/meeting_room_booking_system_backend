import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { LoginUserDto } from "src/user/dto/login-user.dto";
import { UserService } from "src/user/user.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {

  @Inject(UserService)
  private readonly userService: UserService;

  async validate(username: string, password: string): Promise<any> {
    const loginUserDto = new LoginUserDto();
    loginUserDto.username = username;
    loginUserDto.password = password;

    const user = await this.userService.login(loginUserDto);
    if (!user) {
      return null;
    }
    return user;
  }
}