import {parentPort,workerData} from 'node:worker_threads';
import lips from 'lips';
import {createRequire} from 'node:module';
import {dirname,join} from 'node:path';
const require=createRequire(import.meta.url);
try {
 await lips.bootstrap(join(dirname(require.resolve('lips')),'std.xcb'));
 let output='';
 const port=new lips.OutputPort(value=>{output+=String(value);if(output.length>20000)throw Error('Output limit reached');});
 const interpreter=new lips.Interpreter('sicp',{stdout:port,stderr:port});
 await interpreter.exec(workerData.program);
 output='';
 const values=await interpreter.exec(workerData.query);
 const last=values.at(-1);
 const result=String(interpreter.get('repr')(last,true));
 if(!['undefined','#void'].includes(result)) output+=result;
 parentPort.postMessage({actual:output.trim()});
} catch(e){parentPort.postMessage({error:String(e.message??e)});}
