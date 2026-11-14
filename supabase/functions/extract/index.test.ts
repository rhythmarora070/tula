// Runs the extract function against a fake Supabase and a fake model; no network, no keys.
//   cd supabase/functions && deno test --allow-env
import { assertEquals, assertMatch } from 'jsr:@std/assert@1';
import { post, reset, token, USER, world } from '../_shared/test_harness.ts';
import { handle, outputText } from './index.ts';

const NOW = { now: '2026-11-11T14:05', weekday: 'Wednesday' };
const call = (body: unknown, auth?: string | null | Promise<string>) => post(handle, body, auth === undefined ? token() : auth);

Deno.test('rejects a missing, forged or expired sign-in before doing anything', async () => {
  reset();
  for (const auth of [null, 'not-a-jwt', token({ forged: true }), token({ expiresIn: '-1m' })]) {
    const r = await call({ text: 'x', ...NOW }, auth);
    assertEquals(r.status, 401);
    assertEquals((await r.json()).error, 'not_signed_in');
  }
  assertEquals(world.modelBodies.length, 0);
  assertEquals(world.usageInserts.length, 0);
});

Deno.test('reads a text notice through the Interactions API', async () => {
  reset();
  world.modelText = JSON.stringify({ items: [{ title: 'Submit ML lab record', when: 'Friday 5 pm', due: '2026-11-13T17:00' }] });
  const r = await call({ text: 'ML lab record submission by Friday 5 pm', ...NOW });
  assertEquals(r.status, 200);
  const body = await r.json();
  assertEquals(body.items, [{ title: 'Submit ML lab record', when: 'Friday 5 pm', due: '2026-11-13T17:00' }]);
  assertEquals(body.model, 'gemini-3.5-flash-lite');
  // the daily cap is counted for this student only, with the new secret key
  assertEquals(world.usageFilters, [`eq.${USER}`]);
  assertEquals(world.usageInserts, [{ user_id: USER, input: 'text' }]);
  assertEquals([...new Set(world.adminKeys)], ['sb_secret_test']);
  assertEquals(world.modelUrls, ['/v1beta/interactions']);
  // the Gemini key goes in a header, never the URL
  assertEquals(world.modelHeaders[0].get('x-goog-api-key'), 'gemini-test');
  const sent = world.modelBodies[0];
  assertEquals(sent.model, 'gemini-3.5-flash-lite');
  assertEquals(sent.store, false); // Google keeps no copy of the notice
  assertEquals(sent.response_format.type, 'text');
  assertEquals(sent.response_format.mime_type, 'application/json');
  assertEquals(sent.response_format.schema.required, ['items']);
  assertMatch(sent.system_instruction, /Now: Wednesday 2026-11-11 14:05/);
  assertEquals(sent.input, [{ type: 'text', text: 'Notice:\nML lab record submission by Friday 5 pm' }]);
});

Deno.test('sends a screenshot as an image and a PDF as a document', async () => {
  reset();
  assertEquals((await call({ file: { mimeType: 'image/png', data: 'aGVsbG8=' }, ...NOW })).status, 200);
  assertEquals(world.modelBodies[0].input[0], { type: 'image', mime_type: 'image/png', data: 'aGVsbG8=' });
  assertEquals(world.modelBodies[0].input[1].text, 'The notice is the attached file.');
  assertEquals((await call({ file: { mimeType: 'application/pdf', data: 'JVBERi0=' }, text: 'fee notice', ...NOW })).status, 200);
  assertEquals(world.modelBodies[1].input[0], { type: 'document', mime_type: 'application/pdf', data: 'JVBERi0=' });
  assertEquals(world.usageInserts.map((u) => (u as { input: string }).input), ['image', 'pdf']);
});

Deno.test('accepts model output wrapped in an object or in prose', async () => {
  reset();
  world.modelText = JSON.stringify({ items: [{ title: 'A' }] });
  assertEquals((await (await call({ text: 'x', ...NOW })).json()).items, [{ title: 'A' }]);
  world.modelText = 'Here you go:\n[{"title":"B"}]\nDone.';
  assertEquals((await (await call({ text: 'x', ...NOW })).json()).items, [{ title: 'B' }]);
  world.modelText = 'not json at all';
  assertEquals((await (await call({ text: 'x', ...NOW })).json()).items, []);
});

Deno.test('caps reads per day', async () => {
  reset();
  world.usageToday = 3;
  const r = await call({ text: 'x', ...NOW });
  assertEquals(r.status, 429);
  assertEquals(world.modelBodies.length, 0);
});

Deno.test('refuses bad input before calling the model', async () => {
  reset();
  assertEquals((await call({ file: { mimeType: 'application/zip', data: 'x' }, ...NOW })).status, 415);
  assertEquals((await call({ file: { mimeType: 'image/png', data: 'x'.repeat(7_000_001) }, ...NOW })).status, 413);
  assertEquals((await call({ text: '   ', ...NOW })).status, 400);
  assertEquals((await call({ text: 'x', now: 'tomorrow' })).status, 400);
  assertEquals((await call('{not json')).status, 400);
  assertEquals(world.modelBodies.length, 0);
  assertEquals(world.usageInserts.length, 0);
});

Deno.test('reports a model failure without leaking details', async () => {
  reset();
  world.modelStatus = 500;
  const r = await call({ text: 'x', ...NOW });
  assertEquals(r.status, 502);
  assertEquals(await r.json(), { error: 'model_unavailable' });
});

Deno.test('does not count a read when the server has no model key', async () => {
  reset();
  Deno.env.delete('GEMINI_API_KEY');
  try {
    const r = await call({ text: 'x', ...NOW });
    assertEquals(r.status, 503);
    assertEquals(world.usageInserts.length, 0);
  } finally {
    Deno.env.set('GEMINI_API_KEY', 'gemini-test');
  }
});

Deno.test('reads text only from model_output steps', () => {
  const res = {
    steps: [
      { type: 'user_input', content: [{ type: 'text', text: 'ignore me' }] },
      { type: 'thought', content: [{ type: 'text', text: 'also ignore' }] },
      { type: 'model_output', content: [{ type: 'text', text: '{"items":' }, { type: 'text', text: '[]}' }] },
    ],
  };
  assertEquals(outputText(res), '{"items":[]}');
  assertEquals(outputText({}), '');
  assertEquals(outputText(null), '');
});
