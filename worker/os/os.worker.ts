// import { initializeStore } from './create-store';
import createServices from '@service/create-services';

const service = createServices();
// const store = initializeStore(service);


// import { TranspileShService } from '@service/transpile-sh.service';
// import * as Sh from '@service/parse-sh.service';


console.log({ service });

const parsed = service.parseSh.parse('echo foo');
const transpiled = service.transpileSh.transpile(parsed);

console.log({ parsed, transpiled });