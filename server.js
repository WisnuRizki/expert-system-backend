const express = require('express');
const knex = require('knex');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

//Koneksi Database
const db = require('knex')({
    client: 'mysql',
    connection: {
      host : '127.0.0.1',
      user : 'root',
      password : '',
      database : 'dbpakar'
    }
  });

app.get('/',(req,res) =>{
    res.json({
        message: 'succes',
    })
});

app.post('/register', async (req,res) => {
  const {nama,email,password} = req.body;
  console.log(nama,email,password);
  res.json({
    message: 'success'
  })
})

app.post('/login', async (req,res) => {
  try{
    let {email,password} = req.body;
    await db.select('email','password')
    .from('user')
    .where({
      email: email,
      password: password
    }).then(data => {
      if(JSON.parse(JSON.stringify(data)).length === 1){
        res.json({
          message: 'success',
          data: data
        })
      }else{
        res.json({
          message: 'gagal'
        })
      }
      
    })
  }catch(e){
    console.log(e)
  }
    
  
  
})

app.get('/allGejala',(req,res) =>{
    db.select('kd_gejala','nm_gejala')
      .from('gejala')
      .then(data => {
        res.status(200).json({
          data
        });
      })
})

app.get('/allPenyakit',(req,res) =>{
  db.select('id_penyakit','nm_penyakit')
    .from('penyakit')
    .then(data => {
      res.status(200).json({
        data
      });
    })
})

const findOcc = (arr, key) => {
  let arr2 = [];
    
  arr.forEach((x)=>{
       
    // Checking if there is any object in arr2
    // which contains the key value
     if(arr2.some((val)=>{ return val[key] == x[key] })){
         
       // If yes! then increase the occurrence by 1
       arr2.forEach((k)=>{
         if(k[key] === x[key]){ 
           k["occurrence"]++
         }
      })
         
     }else{
       // If not! Then create a new object initialize 
       // it with the present iteration key's value and 
       // set the occurrence to 1
       let a = {}
       a[key] = x[key]
       a["occurrence"] = 1
       arr2.push(a);
     }
  })
    
  //console.log(arr2[0])
  return arr2[0];
}

app.post('/data', async (req,res) => {
  const {gejalaPasien} = req.body;
  console.log(gejalaPasien);
 
  const [queryAwal] = await Promise.all([
    db.select('id_penyakit')
    .from('rule')
    .whereIn(`rule.kd_gejala`,gejalaPasien)
  ]);
  //console.log(JSON.parse(JSON.stringify(queryAwal)));
  
   const hasilCocok = findOcc(queryAwal,'id_penyakit');
    
  const [cekHasil] = await Promise.all([
    db.select('id_penyakit').from('rule').where('id_penyakit',hasilCocok.id_penyakit)
  ]);

  const [hasilAkhir] = await Promise.all([
    db.select('id_penyakit','nm_penyakit').from('penyakit').where('id_penyakit',hasilCocok.id_penyakit)
  ]);


  if(gejalaPasien.length === cekHasil.length){
    res.status(200).json({
      status: 'success',
      hasilAkhir
    });
  }else{
    res.status(200).json({
      status: 'success',
      message: 'tidak ditemukan'
    });
  }

})

const PORT = 3001
app.listen(PORT,() => {
    console.log(`Server is running on port ${PORT}`);
})