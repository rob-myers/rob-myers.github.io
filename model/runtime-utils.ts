import safeJsonStringify from 'safe-json-stringify';
import jsonStringifyPrettyCompact from 'json-stringify-pretty-compact';

/**
 * General purpose stage/shell utils, also for runtime.
 * Defining functions as properties exposes their key in `ls use.Util`.
 */
export class Util {
  static stringify = (...args: Parameters<typeof safeJsonStringify>) => {
    return jsonStringifyPrettyCompact(JSON.parse(safeJsonStringify(...args)));
  }
}
