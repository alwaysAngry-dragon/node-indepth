const mongoose = require('mongoose');

// Unhandled synchronous code
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION!!!');
  console.log(err.name, err.message);
  process.exit(1);
});

// Setting up environment variables from.env file
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const app = require('./app');

const connectionParams = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
};

//
// const DB = process.env.DATABASE.replace(
//   '<PASSWORD>',
//   process.env.DATABASE_PASSWORD
// );
//

mongoose
  .connect(process.env.DATABASE_LOCAL, connectionParams)
  .then((connection) => {
    console.log('Connected to local database');
  })
  .catch((error) => {
    console.log('Error connecting to remote database: ');
    console.log(error);
  });

// START THE SERVER
const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Take care of unhandled rejections

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! �� Shutting down...');
  console.log(err.name, err.message);
  server.close(() => process.exit(1));
});
