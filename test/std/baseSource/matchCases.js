module.exports = [
  {
    name: 'two numbers',
    event: 1,
    pattern: 1,
    matched: true
  },

  //this fails; but we need to think a lot more
  //about how serialization works, and what match does exactly
  // {
  //   name: 'not a number and string',
  //   event: 1,
  //   pattern: '1',
  //   matched: false
  // },

  {
    name: 'two strings',
    event: "foobar",
    pattern: "foobar",
    matched: true
  },
  {
    name: 'two arrays',
    event: ['stuff'],
    pattern: [ 'any' ],
    matched: true
  },
  {
    name: 'two objects',
    event: { foo: 'bar' },
    pattern: { foo: 'bar' },
    matched: true
  },
  {
    name: 'not two strings',
    event: 'bar',
    pattern: 'baz',
    matched: false
  },
  {
    name: 'not two numbers',
    event: 1,
    pattern: 2,
    matched: false
  },
  {
    name: 'not two objects',
    event: { foo: 1 },
    pattern: { bar: 1 },
    matched: false
  },
  {
    name: 'nested objects',
    event: { foo: { bar: { baz: 1 } } },
    pattern: { foo: { bar: { baz: 1 } } },
    matched: true
  },
  {
    name: 'events with more data',
    event: { foo: { bar: { baz: 1 } }, other: 1 },
    pattern: { foo: {} },
    matched: true
  },
  {
    name: 'nested any',
    event: { foo: { bar: { baz: 1 } } },
    pattern: { foo: 'any' },
    matched: true
  },
  {
    name: 'base any',
    event: { foo: { bar: { baz: 1 } } },
    pattern: 'any',
    matched: true
  },
];
