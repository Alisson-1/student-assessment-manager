import { createApp } from './app';

const port = Number(process.env.PORT ?? 3001);

const app = createApp();

app.listen(port, () => {
  console.log(`TALP2 backend listening on http://localhost:${port}`);
});
