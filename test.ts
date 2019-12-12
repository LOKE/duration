import assert from "assert";
import * as m from ".";
import { Duration } from ".";

// parse and format
{
  // duration, canonical form, ...other forms
  const cases: [Duration, string, ...string[]][] = [
    [-60000, "-1m0s"],
    [-1000, "-1s", "-1000ms"],
    [-1, "-1ms", "-0.001s", "-.001s"],
    [0, "0s", "0ms", "0h0s"],
    [1, "1ms", "0.001s", ".001s", "+.001s"],
    [1000, "1s", "1000ms", "1.s", "+1.s"],
    [60000, "1m0s"],
    [3600000, "1h0m0s"],
    [63949, "1m3.949s"],
    [63001, "1m3.001s"],

    // from go
    [2200 * m.MICROSECOND, "2.2ms"],
    [3300 * m.MILLISECOND, "3.3s"],
    [4 * m.MINUTE + 5 * m.SECOND, "4m5s"],
    [4 * m.MINUTE + 5001 * m.MILLISECOND, "4m5.001s"],
    [5 * m.HOUR + 6 * m.MINUTE + 7001 * m.MILLISECOND, "5h6m7.001s"],
    // [8 * m.MINUTE + 0.000000000001, "8m0.000000001s"],
    // [Number.MAX_SAFE_INTEGER, ""],
    // [Number.MIN_SAFE_INTEGER, ""],

    // non int
    [63949.234, "1m3.949234s"],
    [0.001, "1µs", "1\u03bcs", "1us", "0.000001s"],
    [0.1, "100µs"],
    [-0.001, "-1µs", "-1\u03bcs", "-1us", "-0.000001s"],
    [-0.1, "-100µs"]
  ];

  for (const c of cases) {
    const [dur, canonical, ...others] = c;

    const formatOut = m.format(dur);
    assert.strictEqual(
      formatOut,
      canonical,
      `format error: expected m.format(${dur}) => ${canonical}, got ${formatOut}`
    );

    for (const str of [canonical, ...others]) {
      const parseOut = m.parse(str);
      assert.strictEqual(
        parseOut,
        dur,
        `parse error: expected m.parse(${str}) => ${dur}, got ${parseOut}`
      );
    }
  }
}

// invalid strings
{
  const cases = ["", "3", "-", "s", ".", "-.", ".s", "+.s"];

  for (const input of cases) {
    assert.throws(() => m.parse(input), `expected error for ${input}`);
  }
}

// fromHR
{
  const cases: [[number, number], Duration][] = [
    [[2, 977111090], 2977.11109],
    [[123, 977111090], 123977.11109]
  ];

  for (const [hr, dur] of cases) {
    assert.strictEqual(m.fromHR(hr), dur);
  }
}

// toSeconds
{
  const cases: [Duration, number][] = [
    [1000, 1],
    [2977, 2.977],
    [123977, 123.977]
  ];

  for (const [dur, sec] of cases) {
    assert.strictEqual(m.toSeconds(dur), sec);
  }
}
