require('./config/firebase');
const app = require('./app');

const port = 3000;

app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`Upload tool: http://localhost:${port}/upload`);
  
});
