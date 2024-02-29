if(process.env.NODE_ENV !== 'production')
{
    dotenv.config();
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePublicKey= process.env.STRIPE_PUBLIC_KEY;

import express from "express";
import dotenv from "dotenv";
import fs from "fs"; //include to read file
//how to pass secret key to stripe to activate API
import stripePackage from "stripe";

const stripe =new stripePackage(stripeSecretKey);

const app = express(); //create our app

//set view engine that v r going to be using our application this will allow us to embed server-side code inside of out front-end HTML pages 
//front end will be using ejs to render its views
app.set('view engine', 'ejs');
//
app.use(express.json());
//where our static files be stored is indicated in mentioned in the code below
app.use(express.static('public'));


app.get('/store', function(req,res)  {
    fs.readFile('items.json', function(error, data){
        if(error)
        { 
            res.status(500).end();//when error end it
        }
        else{ 
            //we have to render store.html file but have to access values from the express page so store.ejs is used
            res.render('store.ejs', {
                //sending the public key to store.ejs as JS variable. so easy to access in Client side JS 
                stripePublicKey: stripePublicKey,
                //pass various items for it to display
                items: JSON.parse(data)
            });
        }
    });
});

app.post('/purchase', function(req,res){
    fs.readFile('items.json', function(error, data){
        if(error){ res.status(500).end(); }
        else{
            //all the data from json is here in the variable
            const itemsJson = JSON.parse(data);
            //merge both merch & music in to single array
            const itemsArray = itemsJson.music.concat(itemsJson.merch);
            let total = 0;
            //body has json content we need to access it so include app.use statement up in the begining with json
            req.body.items.forEach(function(item) {
                const itemJson = itemsArray.find(function(i){
                    return i.id == item.id;
                });
                total = total + itemJson.price * item.quantity;
            });

            stripe.charges.create({
                amount: total,
                source: req.body.stripeTokenId,
                currency: 'usd'
            }).then(function() { //success of the charging
                console.log('Charge Successful');
                res.json({message: 'Successfully purchased items'});
            }).catch(function(){//failure of charging
                console.log('Charge Fail');
                res.status(500).end();
            });
        }
    });
});

const PORT = process.env.PORT || 3000; // Use the provided port or default to 3000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});