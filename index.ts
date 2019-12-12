/**
 * duration in milliseconds
 */
export type Duration = number;

export const MICROSECOND: Duration = 0.001;
export const MILLISECOND: Duration = 1;
export const SECOND: Duration = 1000 * MILLISECOND;
export const MINUTE: Duration = 60 * SECOND;
export const HOUR: Duration = 60 * MINUTE;
export const DAY: Duration = 24 * HOUR;

const units = new Map([
  ["us", MICROSECOND],
  ["µs", MICROSECOND], // U+00B5 = micro symbol
  ["μs", MICROSECOND], // U+03BC = Greek letter mu
  ["ms", MILLISECOND],
  ["s", SECOND],
  ["m", MINUTE],
  ["h", HOUR]
]);

// const stringFormatRe = /(?<num>[0-9]+\.?|[0-9]*(\.[0-9]+))(?<unit>[^\d\.]+)/g;

function matchAll(str: string) {
  const stringFormatRe = /(?<num>[0-9]+\.?|[0-9]*(\.[0-9]+))(?<unit>[^\d\.]+)/g;
  const matches = [];

  while (true) {
    const match = stringFormatRe.exec(str);

    if (match === null) {
      break;
    }

    matches.push(match);
  }

  return matches;
}

function toPres(val: number, maxDec: number) {
  return val.toFixed(maxDec).replace(/\.?0+$/, "");
}

/**
 * parse a duration string and return duration value in milliseconds
 * @param str - duration string, eg 1h30m0s
 */
export function parse(str: string): Duration {
  if (typeof str === "number") {
    return str;
  }
  if (typeof str !== "string") {
    throw new TypeError("can not parse non string input");
  }

  if (str.trim() === "") {
    throw new Error(`invalid duration "${str}"`);
  }
  if (str === "0") {
    return 0;
  }

  const sign = str.trim().startsWith("-") ? -1 : 1;
  let duration = 0;
  // str.matchAll only works in node 12
  // const parts = str.matchAll(stringFormatRe);
  const parts = matchAll(str);

  let hasParts = false;
  for (const part of parts) {
    hasParts = true;
    // console.log(part);
    const unit = units.get(part.groups!.unit);
    if (!unit) {
      throw new Error(`unknown unit '${part.groups!.unit}' in ${str}`);
    }
    duration += parseFloat(part.groups!.num) * unit;
  }

  if (!hasParts) {
    throw new Error(`invalid duration "${str}"`);
  }

  return sign * duration;
}

/**
 * format converts a duration in milliseconds into a string with units
 * @param duration - time in milliseconds
 */
export function format(duration: Duration): string {
  if (duration === 0) {
    return "0s";
  }
  const neg = duration < 0;
  let rem = Math.abs(duration);

  if (!Number.isInteger(rem) && rem < 1) {
    return ((duration / MICROSECOND) | 0) + "µs";
  }
  if (rem < SECOND) {
    return toPres(duration / MILLISECOND, 3) + "ms";
  }

  // rem to seconds
  rem = rem / SECOND;

  // .toFixed(9).replace is a bit of a hack to deal with floating point errors
  // 9 covers nanoseconds, which is as low as hrtime goes
  let str = toPres(rem % 60, 6) + "s";

  // rem to minutes
  rem = (rem / 60) | 0;

  if (rem > 0) {
    str = (rem % 60) + "m" + str;
    // rem to hours
    rem = (rem / 60) | 0;

    if (rem > 0) {
      str = rem + "h" + str;
    }
  }
  if (neg) {
    str = "-" + str;
  }

  return str;
}

/**
 * converts a hr duration into a more standard millisecond form,
 * @param duration - hr duration from process.hrtime
 */
export function fromHR(duration: [number, number]): Duration {
  const [s, n] = duration;
  return s * 1e3 + n / 1e6;
}

/**
 * converts from milliseconds into seconds, useful for prometheus histograms & gauges
 * @param duration - duration in milliseconds
 */
export function toSeconds(duration: Duration): number {
  return duration / SECOND;
}

/**
 * converts a hr duration into seconds, useful for prometheus histograms & gauges
 * @param duration - hr duration from process.hrtime
 */
export function fromHRToSeconds(duration: [number, number]): Duration {
  const [s, n] = duration;
  return s + n / 1e9;
}
