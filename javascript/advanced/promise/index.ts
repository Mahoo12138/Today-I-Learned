import DbClient from './database';
import DbClient2 from './database2';

// const db = new DbClient();
const db = new DbClient2();

const data =  Promise.all([
  db.getRecord('record1'),
  db.getRecord('record2'),
]);

console.log("start calling");

data.then(res => {
  console.log(res);
})

console.log("end calling");

// while(1){}

export { };
