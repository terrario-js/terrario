const { performance } = require('perf_hooks');
const readLine = require('readline');
//const { compile } = require('./built/peg/compiler');
const { parse } = require('./built/peg/internal/peg-parser');
const { emit } = require('./built/peg/internal/terrario-emitter');

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
			.replace(/\\r/g, '\r')
			.replace(/\\n/g, '\n')
			.replace(/\\t/g, '\t')
			.replace(/\\u00a0/g, '\u00a0');

		try {
			const parseTimeStart = performance.now();
			const ast = parse(input);
			const code = emit(ast);
			const parseTimeEnd = performance.now();
			console.log('=== AST ===');
			console.log(JSON.stringify(ast, null, '  '));
			console.log('=== Code ===');
			console.log(code);
			console.log('============');
			const parseTime = (parseTimeEnd - parseTimeStart).toFixed(3);
			console.log(`time: ${parseTime}ms`);
		}
		catch (err) {
			console.log('error:');
			console.log(err);
		}
		console.log();
	}
}

entryPoint().catch(err => {
	console.log(err);
	process.exit(1);
});
