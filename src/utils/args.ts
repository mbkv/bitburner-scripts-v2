import { Stats } from "../bitburner/servers";

export interface ParserOptions {
  aliases: string[];
  input: 'none' | 'single' | 'multiple';
  type?: (value: string) => unknown;
}

interface Options extends ParserOptions {
  field: string;
}

export type ArgumentsOptions = Record<string, ParserOptions>;

export const parseArgs = (args: readonly string[], options: ArgumentsOptions) => {
  const map = new Map<string, Options>()
  for (const [field, option] of Object.entries(options)) {
    for (const key of option.aliases) {
      map.set(key, {
        ...option,
        field,
      })
    }
  }

  const processed: Record<string, unknown> = {};
  for (let i = 0; i < args.length; i++) {
    if (! map.has(args[i])) {
      continue;
    }

    const options = map.get(args[i])!
    const type = options.type || (value => value);

    if (options.input === 'multiple') {
      const inputs: unknown[] = [];
      i++;
      while (i < args.length && !args[i].startsWith('-')) {
        inputs.push(type(args[i]));
        i++;
      }
      i--;
      processed[options.field] = inputs;
    } else if (options.input === 'single') {
      i++;
      processed[options.field] = type(args[i])
    } else {
      processed[options.field] = true;
    }
  }

  return processed as any;
}

export const parseKnownArgs = (args: readonly string[]): Stats | undefined => {
  const parsed = parseArgs(args, {
    stats: {
      aliases: ['--stats'],
      input: 'single',
      type: str => JSON.parse(str),
    }
  });

  return parsed.stats;
}