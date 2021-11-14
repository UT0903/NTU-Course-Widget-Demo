import mongoose from 'mongoose';

function connectMongo() {
  mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = mongoose.connection;

  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function () {
    db.db.listCollections().toArray((err, names)=>{console.log(names)})
    console.log('mongo connected!');
  });
}

const mongo = {
  connect: connectMongo,
};

export default mongo;
