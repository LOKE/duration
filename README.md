# duration

## Examples

Good for more readable durations

```js
const { MINUTE } = require("@loke/duration");

setTimeout(() => console.log("yay"), 30 * MINUTE);
```

Parsing more human durations from configs

```js
const duration = require("@loke/duration");

// config, could be loaded form file etc
const config = {
  timeoutDuration: "30s"
};

const timeout = duration.parse(config.timeoutDuration); // 30000
```

Format durations for logging and metrics

```js
const duration = require("@loke/duration");
const { Histogram } = require("prom-client");

async function handler() {
  const startTime = process.hrtime();

  await slowThing();

  const dur = duration.fromHR(process.hrtime(startTime));

  console.log(`completed slow thing, duration=${duration.format(dur)}`);
  // completed slow thing, duration=156ms
}
```
