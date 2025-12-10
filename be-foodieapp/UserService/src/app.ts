const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const app: any = express();
const cookieParser = require('cookie-parser');
const Session =require('express-session')
import path from 'path';
import routes from './router'
import { errorResponse } from './utils/response';
import { keycloak } from './config/keyCloak';

const memoryStore = new Session.MemoryStore();

app.use(express.json());
app.use(cors({

    origin: [
        'http://localhost:3000',  
        "http://localhost:5173",
        "https://apigateway-kl70.onrender.com"
    ], 
    credentials: true
}
));

app.use(morgan('dev'));
app.use(cookieParser());

app.use('/api/user',routes);
app.get("/health", (req: any, res: any) => {
  res.status(200).send("OK");
});

app.use((err: any, req: any, res: any, next: any) => {
    console.error(err.stack);
    errorResponse(res, 'Something went wrong!', 500, err)
});

module.exports = app;
