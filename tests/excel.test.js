const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const sandbox = {window:{}, TextDecoder, Blob};
vm.runInNewContext(fs.readFileSync(require.resolve('../dist/excel.js'), 'utf8'), sandbox);
const read = async (name,text) => sandbox.window.ExcelIO.read({name,arrayBuffer:()=>new Blob([text]).arrayBuffer()});

test('TSV 내용의 쉼표를 보존한다', async()=>{
  const data=await read('bus.tsv','운수사\t차량번호\t비고\r\n국제여객\t부산70자1001\t전면, 측면 점검');
  assert.equal(data.rows[0]['비고'],'전면, 측면 점검');
  assert.equal(data.columns.length,3);
});
test('CSV의 한글, 따옴표, 셀 안 줄바꿈과 탭을 보존한다', async()=>{
  const data=await read('bus.csv','\uFEFF운수사,비고\n국제여객,"상행, 하행\n""확인""\t완료"');
  assert.equal(data.rows[0]['비고'],'상행, 하행\n"확인"\t완료');
});
test('빈 머리글에 열 이름을 부여하고 중복 머리글은 거부한다', async()=>{
  const data=await read('bus.csv','운수사,,차량번호\n국제여객,10,부산70자1001');
  assert.equal(data.rows[0]['열2'],'10');
  await assert.rejects(()=>read('bad.csv','운수사,운수사\nA,B'),/중복/);
});
test('닫히지 않은 따옴표는 데이터 손실 없이 오류로 보고한다', async()=>{
  await assert.rejects(()=>read('bad.csv','비고\n"미완성'),/따옴표/);
});
