require('dotenv').config(); // Load environment variables from .env
const app = require('./app');
const http = require('http');

const server = http.createServer(app);

// Start server on the specified port
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export { };