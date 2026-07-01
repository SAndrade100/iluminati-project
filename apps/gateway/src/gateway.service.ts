import { Injectable, HttpException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig } from 'axios';

@Injectable()
export class GatewayService {
  private readonly logger = new Logger(GatewayService.name);

  constructor(private readonly http: HttpService) {}

  async forward(
    serviceUrl: string,
    method: string,
    path: string,
    body?: unknown,
    headers?: Record<string, string>,
  ) {
    const url = `${serviceUrl}${path}`;
    const config: AxiosRequestConfig = {
      method,
      url,
      data: body,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    try {
      const response = await firstValueFrom(this.http.request(config));
      return response.data;
    } catch (err: any) {
      const status = err?.response?.status ?? 502;
      const message = err?.response?.data?.message ?? 'Service unavailable';
      this.logger.error(`Proxy error [${method} ${url}]: ${status} ${message}`);
      throw new HttpException(message, status);
    }
  }
}
