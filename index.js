const express = require('express');
const exphbs = require('express-handlebars')
const mongoose = require('mongoose')
const session = require('express-session')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const MongoStore = require('connect-mongodb-session')(session)
const flash = require('connect-flash')
require('dotenv').config()
const varMiddleware = require('./middleware/var')

const routers = require('./router')

const app = express()


app.use('/images', express.static('images'))
app.use(express.static(__dirname + '/public')) 

const hbs = exphbs.create({
  layoutsDir: "views/layouts",
  defaultLayout: 'layout',
  extname: 'hbs'
})

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')
  
app.use(express.urlencoded({
  extended: true
}))

app.use(express.json())

const store = new MongoStore({
  collection: 'session',
  uri: process.env.MONGODB_URI
})

app.use(session({
  secret: process.env.SESSION_SECRET,
  saveUninitialized: false,
  cookie:{
    maxAge: 1000 * 60 * 60 * 5,
    secure: false,
  },
  resave: true,
  store
}))

const corsOptions = {
  origin: 'http://localhost:8080',
  credentials: true,
}


app.use(cors(corsOptions));
app.use(cookieParser())
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json());
app.use(flash());

app.use(varMiddleware)

app.use(routers)

const PORT = process.env.PORT || 5000
async function dev() {
  try {
    await mongoose.connect(process.env.MONGODB_URI,{useNewUrlParser:true})
    app.listen(PORT,()=>{
      console.log('Server is running on PORT', PORT)
    })
  } catch (error) {
    console.log(error)
  }
}
dev()