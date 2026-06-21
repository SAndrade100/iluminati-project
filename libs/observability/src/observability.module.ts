import { Module } from '@nestjs/common';
import { ObservabilityService } from './observability.service';
import { LoggerModule } from 'nestjs-pino'
import { trace } from '@opentelemetry/api'

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        formatters: {
          level: (label) => ({ level: label }),
        },
        mixin() {
          const activeSpan = trace.getActiveSpan();
          if (!activeSpan) return {};
          
          const spanContext = activeSpan.spanContext();
          return {
            trace_id: spanContext.traceId,
            span_id: spanContext.spanId,
          };
        },
        transport: process.env.NODE_ENV !== 'production' 
          ? { target: 'pino-pretty', options: { colorize: true, singleLine: true } }
          : undefined,
        level: 'info',
      },
    }),
  ],
  exports: [LoggerModule],
})
export class ObservabilityModule {}
