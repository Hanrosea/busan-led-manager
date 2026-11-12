(function(root){
'use strict';
const BUS_COLUMNS=['운수사','인가노선','차량번호','운행구분','제조사','차량구분','상용구분','연료','연식','차대등록일','차량만료일','전면','측면'];
const ROUTE_COLUMNS=['마이비ID','속성','방면','노선명','기점(국문)','기점(영문)','기점(중문)','기점(일문)','종점(국문)','종점(영문)','종점(중문)','종점(일문)','경유지1','경유지2','경유지3'];
const uid=()=>globalThis.crypto?.randomUUID?.()||'id-'+Date.now()+'-'+Math.random().toString(36).slice(2);
const clone=x=>JSON.parse(JSON.stringify(x));
function seed(){
 const companies=['국제여객','금진여객','남부여객','대도운수','대진여객','동남여객','동원여객','신한여객'].map((name,i)=>({id:'c'+i,name,phone:'',address:'',date:'2026-11-12'}));
 const lines=['10','111','124','128-1','138','77','103','113','210','100','1000','96-1'];
 const buses=Array.from({length:24},(_,i)=>({id:'b'+i,'운수사':companies[Math.floor(i/3)].name,'인가노선':lines[i%lines.length],'차량번호':'부산70자'+String(1001+i),'운행구분':i%5===0?'좌석':'일반','제조사':i%3===0?'대우버스':'현대버스','차량구분':'대형','상용구분':'상용','연료':i%3===0?'전기':'CNG','연식':'2022','차대등록일':'2022-10-25','차량만료일':'2031-10-24','전면':'전면','측면':i%7===0?'미설치':i%2?'측면특수':'측면일반'}));
 const destinations=['연제공용차고지','금곡주공1단지','서면','덕천역','다대포','부산역'];
 const routeRows=lines.flatMap((line,i)=>['U','D'].map((dir,j)=>({'마이비ID':String(2601002+i),'속성':'','방면':dir,'노선명':line,'기점(국문)':destinations[(i+j)%destinations.length],'기점(영문)':j?'Busan Station':'Yeonje Bus Garage','기점(중문)':j?'釜山站':'延濟共用車庫','기점(일문)':j?'釜山駅':'ヨンジェ車庫','종점(국문)':destinations[(i+j+2)%destinations.length],'종점(영문)':j?'Yeonje Bus Garage':'Busan Station','종점(중문)':j?'延濟共用車庫':'釜山站','종점(일문)':j?'ヨンジェ車庫':'釜山駅','경유지1':'서면','경유지2':'부산역','경유지3':'교대역'})));
 const file=(id,type,title,name,more={})=>({id,type,title,name,date:'2026-11-12',...more});
 const files=[file('fw1','firmware','R11063','RouteLED_R11063.zip'),file('fw2','firmware','R11065','RouteLED_R11065.zip'),file('rt1','route','bsh_260831','bsh_260831.xlsx',{columns:ROUTE_COLUMNS,rows:routeRows}),file('rt2','route','bsh_261112','bsh_261112.xlsx',{columns:ROUTE_COLUMNS,rows:routeRows.map((r,i)=>({...r,'경유지3':i<2?'하단역환승센터':r['경유지3']}))}),file('msg1','message','환영 메시지','welcome.json',{text:'Welcome to Busan',color:'#f9adff'}),file('msg2','message','부산 도시브랜드','busan-is-good.json',{text:'Busan is good',color:'#ffdf44'})];
 const routeSettings=Object.fromEntries(buses.map(b=>[b.id,{current:'rt1',future:'',at:''}]));
 const messageSettings=Object.fromEntries(buses.map(b=>[b.id,{message:'msg1',enabled:true}]));
 const devices=buses.flatMap((b,i)=>['전면',b['측면']].filter(p=>p!=='미설치').map((position,j)=>({id:b.id+'-'+j,busId:b.id,position,mac:'02:26:11:'+String(i).padStart(2,'0')+':00:0'+j,actual:i===4?'fw1':'fw2',state:i===8?'비정상':'정상',last:'2026-11-12 09:15',registered:'2026-11-01',direction:i%2?'하행':'상행',stop:i+1,kernel:'#1001'})));
 const firmwareSettings=Object.fromEntries(devices.map(d=>[d.id,{current:'fw2',future:'',at:''}]));
 const post=(id,title,company,status,body='검토용 예시 자료입니다.')=>({id,title,company,status,body,author:'관리자',date:'2026-11-12',attachment:'',docType:'A/S 접수 및 처리내역'});
 return {schema:1,companies,buses,busColumns:BUS_COLUMNS,busVersions:[{id:'bv1',title:'bus_261112',columns:BUS_COLUMNS,rows:clone(buses)}],activeBusVersion:'bv1',files,routeSettings,messageSettings,devices,firmwareSettings,boards:{complaints:[post('p1','노선 변경에 따른 행선지 표출 문의','신한여객','미확인')],newbus:[post('p2','신차 출고에 따른 장비 설치 요청','금진여객','미확인'),post('p3','전면·측면 행선지안내기 설치 요청','국제여객','처리완료')],maintenance:[post('p4','측면 LED 모듈 점검 요청','동남여객','진행중'),post('p5','행선지 상·하행 표출 확인 요청','신한여객','처리완료')],history:[post('p6','부산시내버스 LED 행선판 A/S 접수 및 처리내역 (예시)','', '처리완료')],notice:[post('p7','행선지안내기 통합관리프로그램 이용 안내','', '', '파일 관리에서 노선데이터와 메세지를 등록한 뒤, 각 조회/적용 메뉴에서 대상을 선택해 적용합니다. 이 화면의 데이터는 검토용 예시이며 실제 서버 및 장비에 전송되지 않습니다.')]},users:[{id:'u1',login:'admin',name:'슈퍼관리자',phone:'',position:'관리자',role:'슈퍼관리자',company:'',date:'2026-11-12'},{id:'u2',login:'samwon_test',name:'삼원 테스트',phone:'',position:'',role:'유지보수',company:'',date:'2026-11-12'}]};
}
function groups(s,scope){
 if(scope==='vehicle')return s.buses.map(b=>({key:b.id,name:b['차량번호'],sub:b['인가노선'],ids:[b.id]}));
 const key=scope==='company'?'운수사':'인가노선';const map=new Map();s.buses.forEach(b=>{const name=b[key];if(!map.has(name))map.set(name,[]);map.get(name).push(b.id)});
 return [...map].map(([name,ids])=>({key:name,name,ids})).sort((a,b)=>a.name.localeCompare(b.name,'ko',{numeric:true}));
}
function aggregate(map,ids,field){const a=[...new Set(ids.map(id=>map[id]?.[field]??''))];return a.length===1?a[0]:'__mixed';}
function validateSchedule(change,now=new Date()){
 if(change.future && change.future!=='__clear' && change.future!=='__mixed'){
 if(!change.at)throw Error('미래버전 적용일시를 입력해 주세요.');
 const dt=new Date(change.at+'+09:00');if(!Number.isFinite(dt.getTime())||dt<=now)throw Error('미래버전 적용일시는 현재 시간 이후로 입력해 주세요.');
 }
}
function applyVersions(s,mapName,ids,change,{now=new Date()}={}){
 validateSchedule(change,now);const type=mapName==='firmwareSettings'?'firmware':'route';
 for(const field of ['current','future'])if(change[field]&& !['__clear','__mixed'].includes(change[field])&&!s.files.some(f=>f.id===change[field]&&f.type===type))throw Error('사용 가능한 버전을 선택해 주세요.');
 const next=clone(s[mapName]);ids.forEach(id=>{const item={current:'',future:'',at:'',...next[id]};if(change.current&&change.current!=='__mixed')item.current=change.current;if(change.future==='__clear'){item.future='';item.at='';}else if(change.future&&change.future!=='__mixed'){item.future=change.future;item.at=change.at;}next[id]=item;});s[mapName]=next;return ids.length;
}
function applyMessages(s,ids,message,enabled){
 if(message&&!s.files.some(f=>f.id===message&&f.type==='message'))throw Error('등록된 메세지를 선택해 주세요.');
 if(ids.some(id=>enabled===true&&!message&&!s.messageSettings[id]?.message))throw Error('적용할 메세지를 선택해 주세요.');
 ids.forEach(id=>s.messageSettings[id]={message:message||s.messageSettings[id]?.message||'',enabled:enabled??s.messageSettings[id]?.enabled??false});
}
function references(s,id){return [...Object.values(s.routeSettings),...Object.values(s.firmwareSettings),...Object.values(s.messageSettings)].some(x=>x.current===id||x.future===id||x.message===id)||s.devices.some(d=>d.actual===id);}
function validateBuses(rows){const plates=new Set();rows.forEach((r,i)=>{const p=String(r['차량번호']||'').trim();if(!p)throw Error((i+1)+'행 차량번호를 입력해 주세요.');if(plates.has(p))throw Error('차량번호가 중복됩니다: '+p);plates.add(p);if(!r['운수사']||!r['인가노선'])throw Error((i+1)+'행 운수사와 인가노선을 입력해 주세요.');});}
const api={BUS_COLUMNS,ROUTE_COLUMNS,uid,clone,seed,groups,aggregate,validateSchedule,applyVersions,applyMessages,references,validateBuses};root.BusCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
