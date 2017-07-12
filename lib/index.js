const pathToRegexp = require("path-to-regexp");

class Router {
	constructor() {
		this.middlewares = [];
	}

	use(path, fn) {
		if (typeof fn !== "function") {
			throw new TypeError("use middleware must be a function!");
		}
		this.middlewares.push({ path, fn });
	}

	compose(middlewares) {
		if (!Array.isArray(middlewares)) {
			throw new TypeError("middlewares stack must be an array!");
		}
		for (const fn of middlewares) {
			if (typeof fn !== "function") {
				throw new TypeError(
					"middlewares must be composed of functions!"
				);
			}
		}

		return function(contexts, next) {
			// last called middlewares #
			let index = -1;
			return dispatch(0);
			function dispatch(i) {
				if (i <= index)
					return Promise.reject(
						new Error("next() called multiple times")
					);
				index = i;
				let fn = middlewares[i];
				if (i === middlewares.length) fn = next;
				if (!fn) return Promise.resolve();
				try {
					return Promise.resolve(
						fn(contexts[i], function next() {
							return dispatch(i + 1);
						})
					);
				} catch (err) {
					return Promise.reject(err);
				}
			}
		};
	}

	onerror(err) {
		const msg = err.stack || err.toString();
		console.error();
		console.error(msg.replace(/^/gm, "  "));
		console.error();
	}

	parse(argv) {
		argv.shift();
		argv.shift();

		let keys,
			regexp,
			regres,
			param = {},
			params = [],
			middlewares = [];
		for (let key in this.middlewares) {
			keys = [];
			regexp = pathToRegexp(this.middlewares[key].path, keys, {
				delimiter: " "
			});
			regres = regexp.exec(argv.join(" "));
			if (!regres) {
				continue;
			}

			param = {};
			for (let k in keys) {
				param[keys[k].name] = regres[parseInt(k) + 1];
			}

			params.push(param);
			middlewares.push(this.middlewares[key].fn);
		}

		const fn = this.compose(middlewares);
		const ctx = [];
		for (let key in params) {
			ctx.push({
				path: argv.join(" "),
				params: params[key]
			});
		}
		fn(ctx).catch(this.onerror);
	}
}

module.exports = Router;