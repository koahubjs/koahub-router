## Introduce

The complete solution for node.js command-line programs with router

## Usage

```sh
const Router = require("koahub-router");
const router = new Router();

router.use("--registry :registry", async (ctx, next) => {
	console.log(1);
	await next();
});
router.use("--registry :registry", async (ctx, next) => {
	console.log(2);
});

router.parse(process.argv);
```