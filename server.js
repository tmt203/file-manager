// MODULES
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const db = require('./src/utils/database');
const app = require('./src/app');

// INIT
const port = process.env.PORT || 3000;

// Run DB
db.connect((error) => {
  if (error) {
    console.log(error);
  } else {
    console.log('Database connected');
  }
});

// SERVER
app.listen(port, () => console.log(`Server is running on port ${port}`));
