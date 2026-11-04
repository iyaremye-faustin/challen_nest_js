import { Logger } from '@nestjs/common';
import { bootstrap } from './bootstrap';

void (async () => {
  // NOSONAR
  try {
    const app = await bootstrap();
    await app.listen(process.env.PORT ?? 3000);
    Logger.log(`App listening on port ${process.env.PORT ?? 3000}`);
  } catch (error) {
    Logger.error(`Failed to start application: ${error}`);
    process.exit(1);
  }
})();
