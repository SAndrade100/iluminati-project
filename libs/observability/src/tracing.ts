import { NodeSDK } from '@opentelemetry/sdk-node'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc'
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'

const traceExporter = new OTLPTraceExporter({
    url: 'grpc://localhost:4317',
})

const metricExporter = new OTLPMetricExporter({
    url: 'grpc://localhost:4317'
})

export const otelSDK = new NodeSDK({
    serviceName: process.env.OTEL_SERVICE_NAME || 'unkown-service',
    traceExporter,
    metricReader: new PeriodicExportingMetricReader({
        exporter: metricExporter,
        exportIntervalMillis: 5000,
    }),
    instrumentations: [
        getNodeAutoInstrumentations({
            '@opentelemetry/instrumentation-http': {}
        })  
    ]
})

process.on('SIGTERM', () => {
  otelSDK
    .shutdown()
    .then(() => console.log('SDK do OpenTelemetry encerrado.'))
    .catch((err) => console.log('Erro encerrando SDK OpenTelemetry', err))
    .finally(() => process.exit(0));
});