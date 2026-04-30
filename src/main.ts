import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// Use synchronous stderr writes during bootstrap so pino/buffering can't swallow them.
const log = (msg: string) => process.stderr.write(`[bootstrap] ${msg}\n`);

log(`node version=${process.version} pid=${process.pid}`);
log(`PORT env=${process.env.PORT ?? '(unset)'}`);

async function bootstrap() {
  log('creating Nest application...');
  const app = await NestFactory.create(AppModule, {
    bufferLogs: false,
  });

  app.enableCors({
    origin: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  const port = Number(process.env.PORT) || 3000;
  log(`calling app.listen(${port}, '0.0.0.0')...`);
  await app.listen(port, '0.0.0.0');
  log(`listening on 0.0.0.0:${port}`);
}

process.on('uncaughtException', (err) => {
  process.stderr.write(`[bootstrap] uncaughtException: ${err?.stack ?? err}\n`);
  process.exit(1);
});
process.on('unhandledRejection', (err) => {
  process.stderr.write(`[bootstrap] unhandledRejection: ${(err as Error)?.stack ?? err}\n`);
  process.exit(1);
});

bootstrap().catch((err) => {
  process.stderr.write(`[bootstrap] failed: ${err?.stack ?? err}\n`);
  process.exit(1);
});
