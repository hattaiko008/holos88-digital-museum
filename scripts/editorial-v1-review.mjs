// Evidence review only. Never turns a production check into ECHO publication approval.
import {readFile,writeFile,rename} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {hash,readyForCFO} from '../lib/editorial-v1.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
export async function review(dir,evidenceFile){
  const folder=resolve(dir),prefix=resolve(root,'work')+'/';
  if(!folder.startsWith(prefix))throw Error('Private job folder required');
  const load=async p=>JSON.parse(await readFile(p,'utf8'));
  const [packet,pack,evidence]=await Promise.all([load(resolve(folder,'packet.json')),load(resolve(folder,'review-pack.json')),load(resolve(evidenceFile))]);
  for(const ref of packet.sourceRefs){
    const p=resolve(root,ref.path);
    if(!p.startsWith(root)||hash(await readFile(p))!==ref.sha256)throw Error('Source changed; review invalidated: '+ref.path);
  }
  if(hash(await readFile(resolve(folder,'preview.html')))!==pack.artifactSha256)throw Error('Artifact changed; review invalidated');
  const result={...pack,...readyForCFO(pack,evidence)};
  await writeFile(resolve(folder,'review-pack.json.tmp'),JSON.stringify(result,null,2)+'\n');await rename(resolve(folder,'review-pack.json.tmp'),resolve(folder,'review-pack.json'));
  const handoff=await load(resolve(folder,'handoff.json'));
  handoff.status=result.state;handoff.pending=result.pendingChecks;
  handoff.verificationEvidenceRef=resolve(evidenceFile);
  await writeFile(resolve(folder,'handoff.json.tmp'),JSON.stringify(handoff,null,2)+'\n');await rename(resolve(folder,'handoff.json.tmp'),resolve(folder,'handoff.json'));
  return {state:result.state,pendingChecks:result.pendingChecks,approvalRequired:true,scheduled:false,published:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))try{console.log(JSON.stringify(await review(process.argv[2],process.argv[3])));}catch(e){console.error(e.message);process.exitCode=1;}
