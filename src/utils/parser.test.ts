import { expect, test, describe } from 'vitest'
import { parseTags } from './parser';

describe('Tag parsing', function () {
  test('empty string', function () {
    expect(parseTags('')).to.deep.equal([]);
  });

  test('empty string', function () {
    const parse = ()=> parseTags('          ');
    expect(parse).to.throw;
  });

  test('single valid word', function () {
    expect(parseTags('a')).to.deep.equal(['a']);
  });

  test('single valid word', function () {
    expect(parseTags('aa')).to.deep.equal(['aa']);
  });

  test('single valid word', function () {
    expect(parseTags('aabb')).to.deep.equal(['aabb']);
  });

  test('two valid words', function () {
    expect(parseTags('a,a')).to.deep.equal(['a', 'a']);
  });

  test('two valid words', function () {
    expect(parseTags('aa,bb')).to.deep.equal(['aa', 'bb']);
  });

  test('single invalid word', function () {
    const parse = () => parseTags('l#üp');

    expect(parse).to.throw;
  });

  test('two invalid word', function () {
    const parse = () => parseTags('l#üp,389äö');
    expect(parse).to.throw;
  });
});
