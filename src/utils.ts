import { HttpException, HttpStatus, ParseIntPipe } from '@nestjs/common';
import * as crypto from 'crypto';

export function md5(str: string) {
  return crypto.createHash('md5').update(str).digest('hex');
}

export function generateParseIntPipe(name: string) {
  return new ParseIntPipe({
    exceptionFactory: () => {
      return new HttpException(`${name} 必须是数字`, HttpStatus.BAD_REQUEST);
    }
  })
}