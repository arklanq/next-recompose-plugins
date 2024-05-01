import * as module_main from '../src/main.js';

describe('Library entrypoint (main)', () => {
  test('exports `Config`', () => {
    expect(module_main).toMatchObject({
      Config: expect.any(Function),
    });
  });
});
