import 'dotenv/config';
import { startApp } from './boot/setup';

(() => {
  try {
    startApp();
  } catch (error) {
    console.error('Error in index.ts => startApp');
    console.error(`Error: ${JSON.stringify(error, undefined, 2)}`);
  }
})();
