const { performance } = require('perf_hooks');
const readLine = require('readline');
const { parse } = require('./built/peg/index');


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
			const result = parse(input);
			const parseTimeEnd = performance.now();
			console.log(JSON.stringify(result));
			const parseTime = (parseTimeEnd - parseTimeStart).toFixed(3);
			console.log(`parsing time: ${parseTime}ms`);
		}
		catch (err) {
			console.log('parsing error:');
			console.log(err);
		}
		console.log();
	}
}

entryPoint().catch(err => {
	console.log(err);
	process.exit(1);
});
