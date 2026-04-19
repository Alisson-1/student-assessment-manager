import path from 'node:path';

export function getDataDir(): string {
  return process.env.TALP2_DATA_DIR
    ? path.resolve(process.env.TALP2_DATA_DIR)
    : path.resolve(__dirname, '..', '..', 'data');
}
