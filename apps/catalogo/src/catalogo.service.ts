import { Injectable } from '@nestjs/common';

@Injectable()
export class CatalogoService {
  getHello(): string {
    return 'Hello World!';
  }
}
