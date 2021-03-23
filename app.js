const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const path = require('path')
const app = express()
const session = require('express-session')
const flash = require('connect-flash')
const mongoose = require('mongoose')
const website = require('./routes/website')
const admin = require('./routes/admin')
const passport = require('passport')
require('./config/auth')(passport)

//Config

app.use(session({
    secret: 'australia',
    resave: true,
    saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(flash())


//Middleware

app.use(function(req, res, next){
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.user = req.user || null;
    next()
})

//Bodyparser

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

//Handlebars

app.engine('handlebars', handlebars({defaultLayout: 'main'}))
app.set('view engine', 'handlebars')

//Mongoose

mongoose.Promise = global.Promise
mongoose.connect('mongodb+srv://AustraliaEstudios:b1l1ona1re@cluster0.puuiz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority').then(function(){
    console.log('Conectado ao mongo.')
  }).catch(function(err){
    console.log('Erro ao se conectar com o mongo: '+err)
  })


//public

app.use(express.static(path.join(__dirname, 'public')))

//Rotas

app.use('/website', website)
app.use('/admin', admin)

app.get('/', function(req, res){
    res.render('index')
})

//iniciando servidor

const PORT = process.env.PORT || 3000
app.listen(PORT, ()=> {
    console.log("Servidor rodando no talo!")
})
