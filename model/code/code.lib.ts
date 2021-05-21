//@ts-expect-error
import fileJs from '!!raw-loader!./lib/file';

export const initialCode = {
  'file.js': fileJs,
};
