var express = require('express');
var router = express.Router();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const Todo = require("../models/Todo");
const { validate } = require('../models/User');
const { token } = require('morgan');
const jwt = require("jsonwebtoken");
const validateToken = require('../auth/validateToken.js');
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({storage});

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

// Register (task 1)
router.post('/api/user/register', // Registration validation (task 4)
  body("email").isEmail(),
  body('password').isStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
  }),
  //upload.none(),
  (req, res, next) => {
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }

    User.findOne({ email: req.body.email }, (err, user) => {
      if (err) throw err;
      if (user) {
        return res.status(403).json({ email: "Email already in use" });
      } else {
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(req.body.password, salt, (err, hash) => {
            if (err) throw err;
            User.create(
              {
                email: req.body.email,
                password: hash
              }, (err, ok) => {
                if (err) throw err;
                //res.redirect("/login.html"); 
                //changed for week 10 task 1 and task 5
                return res.status(200).json({ msg: "Everything ok" });
              }
            )
          })
        })
      }
    })
  }
)

// Log in (task 2)

router.post("/api/user/login",
  // body("email").isLength({ min: 3 }),
  // body("password").isLength({ min: 5 }),
  upload.none(),
  (req, res, next) => {
    User.findOne({ email: req.body.email }, (err, user) => {
      if (err) throw err;
      if (!user) {
        return res.status(403).json({ message: "Invalid credentials" });
      } else {
        bcrypt.compare(req.body.password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            const jwtPayload = {
              id: user._id,
              email: user.email
            }
            jwt.sign(
              jwtPayload,
              process.env.SECRET,
              {
                expiresIn: 600
              },
              (err, token) => {
                res.json({ success: true, token });
              }
            );
          }else{ // For week 10 task 5
            return res.json({ message: "Invalid credentials" });
          }
        })
      }
    })
  }
)

// Route that requires authentication (task 3)
router.get("/api/private", validateToken, (req, res, next) => {
  res.json({ email: req.user.email });
})

// Todos (task 5)
router.post('/api/todos', validateToken, (req, res) => {
  Todo.findOne({ user: mongoose.Types.ObjectId(req.user.id) }, (err, todo) => {
    if (err) throw err;
    if (todo) {
      Todo.updateOne(
        { user: mongoose.Types.ObjectId(req.user.id) }, { $push: { items: { $each: req.body.items } } },
        (err, todo) => {
          if (err) throw err;
          return res.sendStatus(200);
        });
    } else {
      Todo.create(
        {
          user: mongoose.Types.ObjectId(req.user.id),
          items: req.body.items
        }, (err, ok) => {
          if (err) throw err;
          return res.sendStatus(200);
        }
      );
    }
  })
})


// Week 10

// Task 1
router.get('/register.html', function (req, res, next) {
  res.render('register');
});

router.get('/login.html', function (req, res, next) {
  res.render('login');
});

// Task 4

router.get('/api/user/todos', validateToken, (req, res, next) => {
  Todo.findOne({ user: mongoose.Types.ObjectId(req.user.id) }, (err, todos) => {
    if (err) throw err;
    if (todos) {
      res.json(todos.toJSON());
    }
  })
});

module.exports = router;
