import { performance } from 'perf_hooks';
import * as readLine from 'readline';
import { calculator } from './build/index.js';

class InputCanceledError extends Error {
  constructor(message) {
    super(message);
  }
}

function inputLine(message) {
  return new Promise((resolve, reject) => {
    const rl = readLine.createInterface(process.stdin, process.stdout);
    rl.question(message, (ans) => {
      rl.close();
      resolve(ans);
    });
    rl.on('SIGINT', () => {
      console.log('');
      rl.close();
      reject(new InputCanceledError('SIGINT interrupted'));
    });
  });
}

async function entryPoint() {
  while (true) {
    let input;
    try {
      input = await inputLine('> ');
    }
    catch (err) {
      if (err instanceof InputCanceledError) {
        return;
      }
      throw err;
    }

    input = input
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\u00a0/g, '\u00a0');

    try {
      const parseTimeStart = performance.now();
      const result = calculator(input);
      const parseTimeEnd = performance.now();
      console.log(result);
      const parseTime = (parseTimeEnd - parseTimeStart).toFixed(3);
      console.log(`execution time: ${parseTime}ms`);
    }
    catch (err) {
      console.error(err);
    }
    console.log();
  }
}

entryPoint().catch(err => {
  console.log(err);
  process.exit(1);
});
