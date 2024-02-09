const express = require('express');
const { engine } = require('express-handlebars');
const Handlebars = require('handlebars');
const bodyParser = require('body-parser')
const fs = require('fs')
const {products} = require('./products.json');

const getCategories = (products)=>{
    const uniqueCategories = new Set(products.map(item => item.category));
    return Array.from(uniqueCategories).map(category => ({ category }));
}

const port = process.env.PORT || 3000
const app = express();

app.use(bodyParser.urlencoded({ extended: false }))

app.engine('handlebars', engine())
app.set('view engine','handlebars')
app.set('views', './views')

const checkpayload = (req, res, next)=>{
    const {name, category, price}= req.body
    if(name && category && price){
        next()
    }else{
        const err = new Error("Can not add product. Some properties missing")
        next(err)
    }
}

app.get('/', (req, res)=>{
    res.render('home',{product:products})
})
app.get('/filterProducts')
app.get('/add-product-form',(req, res)=>{
    res.render('add_form', {product:products, categories: getCategories(products)})
})
app.get('/update-product-form/:id', (req, res)=>{
    res.render('update_form')
})

app.post('/products',(req, res, err=false)=>{
    if(!err){
        const payload = JSON.parse(req.body)
        products.push(payload)
        fs.writeFile('./products.json', products, err =>{
            if(err){
                console.log('Error writing the file', err)
                res.render('home', {
                    product:products, 
                    categories: getCategories(products), 
                    err:"Failed to write to the file, try again"
                })
            }
        })
        res.render('home', {products: products})
    }else{
        res.render('home', {
            product:products, 
            categories: getCategories(products), 
            err:"Failed to write to the file, try again"
        })
    }
})

app.listen(port, ()=>{
    console.log(`Server started on port ${port}, Press control + C to exit.......`)
})
