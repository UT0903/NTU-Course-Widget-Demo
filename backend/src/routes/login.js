import { Router } from 'express';
import { try_login, test } from '../functions/loginAndUpdate'
import { encrypt, decrypt } from '../functions/crypto';
import printLog from '../functions/printLog';
import convertCustom from '../functions/convertCustom';
const router = Router();
//POST /login body: {"account": "b0792xxx", "password": "xxxxxxx"}
router.post("/login", async (req, res) => {
  console.log("login", req.body?.account);
  
  if (req.body?.account && req.body?.password) {
    try{
      const acc = req.body.account.toLowerCase().trim();
      const pwd = req.body.password.trim();
      printLog(`${acc} ask for login`);
      try_login(acc, pwd, res, "craw_grade");
      return 
    }
    catch{
      printLog(`unexpected Error in /login`)
    } 
  }
  else{
    res.status(200).send("login failed, without account or password");
  }
  
});
router.post("/getTodos", async (req, res) => {
  console.log("getTodos", req.body?.account);
  if (req.body.account && req.body.password) {
    //try{
      const acc = req.body.account.toLowerCase().trim();
      const pwd = req.body.password.trim();
      printLog(`${acc} ask for getTodos`);
      try_login(acc, pwd, res, "get_todos");
      return;
    //}
    //catch{
    //  printLog(`unexpected Error in /getTodos`)
    //}
  }
  else{
    res.status(200).send("login failed, without account or password");
  }
})

router.post('/test', async (req, res) => {
  //await test();
  res.status(200).send("test")
});
export default router;
