const tagAlphabet = /[0-9a-z\\-]+/;

export function parseTags(str: string): string[] {
  const tokens: string[] = [];
  let token = "";

  function add(token: string) {
    if (token.length > 0) {
      tokens.push(token);
    }
  }

  for (let i=0; i < str.length; i++) {
    const c = str.charAt(i)
    if (c === ",") {
      add(token);
      token = "";
      continue;
    }
    if (tagAlphabet.test(c)) {
      token += c;
    } else {
      throw new Error("Invalid character: " + c);
    }
  }
  add(token);

  return tokens;
}
