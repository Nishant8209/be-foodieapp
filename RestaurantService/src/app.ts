const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const app: any = express();
const cookieParser = require('cookie-parser');
import routes from './routers/index'
import { errorResponse } from './utils/response';


app.use(express.json());
app.use(cors({
    // origin: [
    //     'http://localhost:3001',  
    //     "http://localhost:5173"
    // ], 
    credentials: true
}
));
app.use(morgan('dev'));
app.use(cookieParser());


app.use('/api/restaurant', routes);


app.use((err: any, req: any, res: any, next: any) => {
    console.error(err.stack);
    errorResponse(res, 'Something went wrong!', 500, err)
});

module.exports = app;
