require('dotenv').config()

//Requests
const express = require('express')
const mongoose = require('mongoose')

const {createServer} = require('http')

const port = 5000;

/* for to validate and authentication*/
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const User = require('./modules/User')

const bcrypt = require('bcrypt')

const {
  checkAuthenticated,
  checkNotAuthenticated
} = require('./middlewares/auth')
/*------------------------------------------*/

const app = express()


//Find users
const initializePassport = require('./passport-config')
const {check} = require("express-validator");
initializePassport(
  passport,
  async (email) => {
    const userFound = await User.findOne({email})
    return userFound
  },
  async (id) => {
    const userFound = await User.findOne({_id: id})
    return userFound
  }
)


///for css in ejs
app.use(express.urlencoded({extended: true}))

app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.use(express.static(__dirname + '/public'));
app.set('view-engine', 'ejs')
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/public/css'));
app.use(express.static(__dirname + '/public/mtrls'));
app.use(express.static(__dirname + '/public/js'));

app.get('/', function (req, res) {
  res.render('AnimeInfo.ejs');
});
app.get('/list', function (req, res) {
  res.render('AnimeList.ejs');
});
app.get('/t1', function (req, res) {
  res.render('AnimeTitleN1.ejs');
});
app.get('/listT', function (req, res) {
  res.render('ListOfT.ejs');
});
app.get('/t2', function (req, res) {
  res.render('AnimeTitleN2.ejs');
});
app.get('/t3', function (req, res) {
  res.render('AnimeTitleN3.ejs');
});
app.get('/t4', function (req, res) {
  res.render('AnimeTitleN4.ejs');
});
app.get('/t5', function (req, res) {
  res.render('AnimeTitleN5.ejs');
});
app.get('/t6', function (req, res) {
  res.render('AnimeTitleN6.ejs');
});
app.get('/t7', function (req, res) {
  res.render('AnimeTitleN7.ejs');
});
app.get('/t8', function (req, res) {
  res.render('AnimeTitleN8.ejs');
});
app.get('/t9', function (req, res) {
  res.render('AnimeTitleN9.ejs');
});
app.get('/t10', function (req, res) {
  res.render('AnimeTitleN10.ejs');
});
/*app.get('/greet', function(req, res) {
    res.render('greeting.ejs');
});*/
app.get('/ind', function (req, res) {
  res.render('index.ejs');
});

app.get('/adminPanel', async function (req, res) {
  if (req?.user?.isAdmin) {
    const allUsers = await User.find()
    res.render('adminPanel.ejs', {allUsers})
  } else {
    res.redirect('/')
  }
})
app.post('/deleteUser', async function (req, res) {
  const {id} = req.body
  await User.deleteOne({_id: id})
  const allUsers = await User.find()
  res.render('adminPanel.ejs', {allUsers})
})
app.post('/adminPanel', async function (req, res) {
  const {sortOption} = req.body
  const allUsers = await User.find()
  if (sortOption === 'city'){
    function compare( a, b ) {
      if ( a.city.toLowerCase() < b.city.toLowerCase() ){
        return -1;
      }
      if ( a.city.toLowerCase() > b.city.toLowerCase() ){
        return 1;
      }
      return 0;
    }
    allUsers.sort( compare );
  }
  else if(sortOption === 'email'){
    function compare( a, b ) {
      if ( a.email.toLowerCase() < b.email.toLowerCase() ){
        return -1;
      }
      if ( a.email.toLowerCase() > b.email.toLowerCase() ){
        return 1;
      }
      return 0;
    }
    allUsers.sort( compare );
  }
  else if(sortOption === 'name') {
    function compare( a, b ) {
      if ( a.name.toLowerCase() < b.name.toLowerCase() ){
        return -1;
      }
      if ( a.name.toLowerCase() > b.name.toLowerCase() ){
        return 1;
      }
      return 0;
    }
    allUsers.sort( compare );
  }
  console.log(allUsers)
  res.render('adminPanel.ejs', {allUsers, sortOption})
})
///---Authenticated or not???---///
app.get('/logout', checkAuthenticated, (req, res) => {
  console.log(req.user.isAdmin)
  res.render("greeting.ejs", {name: req.user.name, user: req.user})//GO TO PROFILE!!!! NOT MAIN
})
app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
})



app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/logout',
    failureRedirect: '/login',
    failureFlash: true,
  })
)

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs')
})

app.post('/updateNewData', async function (req, res) {
  const {name, city, email, id} = req.body
  const user = await User.findById(id)
  user.email = email
  user.city = city
  user.name = name
  await user.save()
  const allUsers = await User.find()
  res.render('adminPanel.ejs', {allUsers})
})

app.post('/addNewUser', async function (req, res) {
  const userFound = await User.findOne({email: req.body.email})
  console.log('hey')
  if (userFound) {
    req.flash('error', 'User already exist (¬-¬)')
    res.redirect('/register')
  } else {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10)
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        city: req.body.city,
        password: hashedPassword
      })
      console.log(await user.save()) //Add to DB

      res.redirect('/login')

    } catch (e) {
      console.log(e)
      res.redirect('/register')
    }
  }
})

//---Register case---//
app.post('/register', checkNotAuthenticated, async (req, res) => {
  const userFound = await User.findOne({email: req.body.email})
  console.log('hey')
  if (userFound) {
    req.flash('error', 'User already exist (¬-¬)')
    res.redirect('/register')
  } else {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10)
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        city: req.body.city,
        password: hashedPassword
      })

      console.log(await user.save()) //Add to DB

      res.redirect('/login')

    } catch (e) {
      console.log(e)
      res.redirect('/register')
    }
  }
})

app.delete('/logout', (req, res) => {
  req.logOut()
  res.redirect('/login')
})

mongoose.connect('mongodb+srv://Aveliya:87071153500Zoro@cluster0.4iyrg.mongodb.net/console?retryWrites=true&w=majority', {
  useNewUrlParser: true,
}).then(() => console.log('Rise...omurice'))
  .catch(e => console.log(e))

//app.listen(port) } } )
const server = createServer(app)
server.listen(port, () => console.log('server is up.'))
