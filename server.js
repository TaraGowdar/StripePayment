import express from "express";
import stripe from "stripe";

const app = express(); //create our app

//set view engine that v r going to be using our application this will allow us to embed server-side code inside of out front-end HTML pages 
//front end will be using ejs to render its views
app.set('view engine', 'ejs');
//where our static files be stored is indicated in mentioned in the code below
app.use(express.static('public'));

app.listen(3000);