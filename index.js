require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const userRoute = require('./routes/userRoute');
const postRoute = require('./routes/postRoute');
const mongoString = process.env.DATABASE_URL;

mongoose.connect(mongoString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const database = mongoose.connection;

database.on('error', (error) => {
    console.log(error)
})

database.once('connected', () => {
    console.log('Database Connected');
})

const app = express();

app.use(express.json());
app.use('/user', userRoute);
app.use('/post', postRoute);

const port = process.env.PORT || 3000

app.listen(port, () =>{
    console.log(`Server started at port ${port}`)
})