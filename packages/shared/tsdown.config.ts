import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    env: 'src/schemas/env/index.ts',
  },
});
