const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const app: any = express();
const cookieParser = require('cookie-parser');
import routes from './routes/index'


app.use(express.json());
app.use(cors({
    origin: [
        'http://localhost:3001',  
        "http://localhost:5174",
         "http://localhost:5173",
         "http://localhost:5175",
         "http://localhost:8081/"
    ], 
    credentials: true
}
));
app.use(morgan('dev'));
app.use(cookieParser());


app.use('/api', routes);


app.use((err: any, req: any, res: any, next: any) => {
    console.error(err.stack);
   
});

module.exports = app;