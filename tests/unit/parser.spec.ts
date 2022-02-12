import { expect } from 'chai';
import { parseTags } from '@/utils/parser';

describe('Tag parsing', function () {
  it('empty string', function () {
    expect(parseTags('')).to.deep.equal([]);
  });

  it('empty string', function () {
    const parse = ()=> parseTags('          ');
    expect(parse).to.throw;
  });

  it('single valid word', function () {
    expect(parseTags('a')).to.deep.equal(['a']);
  });

  it('single valid word', function () {
    expect(parseTags('aa')).to.deep.equal(['aa']);
  });

  it('single valid word', function () {
    expect(parseTags('aabb')).to.deep.equal(['aabb']);
  });

  it('two valid words', function () {
    expect(parseTags('a,a')).to.deep.equal(['a', 'a']);
  });

  it('two valid words', function () {
    expect(parseTags('aa,bb')).to.deep.equal(['aa', 'bb']);
  });

  it('single invalid word', function () {
    const parse = () => parseTags('l#üp');

    expect(parse).to.throw;
  });

  it('two invalid word', function () {
    const parse = () => parseTags('l#üp,389äö');
    expect(parse).to.throw;
  });
});
