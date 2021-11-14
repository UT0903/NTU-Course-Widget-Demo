import mongo from './mongo';
import express from 'express';
import cors from 'cors';
import routes from './routes';
import requestIp from 'request-ip';
import tooMuchIP from './functions/tooMuchIP';
// gotta load in MONGO_URL before `mongo.connect()`
require('dotenv-defaults').config();

const app = express();
app.use(cors());
app.use(express.json());
app.all('/*', (req, res, next) =>{
  const ip = requestIp.getClientIp(req);
  if(tooMuchIP(ip)){
    res.status(403).send("too much request, please try again later");
    return 
  }
  console.log('app all', ip)
  next()
})
app.use('/', routes);

mongo.connect();

const server = app.listen(process.env.PORT || 4000, function () {
  console.log('Listening on port ' + server.address().port);
});
