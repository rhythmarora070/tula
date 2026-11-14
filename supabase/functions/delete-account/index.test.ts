import { assertEquals } from 'jsr:@std/assert@1';
import { OTHER_USER, post, reset, token, world } from '../_shared/test_harness.ts';
import { handle } from './index.ts';

Deno.test('deletes only the signed-in student', async () => {
  reset();
  const r = await post(handle, {}, token({ sub: OTHER_USER }));
  assertEquals(r.status, 200);
  assertEquals(await r.json(), { deleted: true });
  assertEquals(world.deletedUsers, [OTHER_USER]);
  assertEquals([...new Set(world.adminKeys)], ['sb_secret_test']);
});

Deno.test('refuses without a valid sign-in', async () => {
  reset();
  for (const auth of [null, token({ forged: true }), token({ expiresIn: '-1m' })]) {
    assertEquals((await post(handle, {}, auth)).status, 401);
  }
  assertEquals(world.deletedUsers, []);
});

Deno.test('only accepts POST', async () => {
  reset();
  assertEquals((await handle(new Request('http://fn.test/', { method: 'GET' }))).status, 405);
  assertEquals((await handle(new Request('http://fn.test/', { method: 'OPTIONS' }))).status, 200);
});
