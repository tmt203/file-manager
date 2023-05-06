// MODULES
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const express = require('express');

const connection = require('../utils/database');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// INIT
const queryPromise = promisify(connection.query).bind(connection);

const register = catchAsync(async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;

  // Validation input
  if (!name || !email || !password || !confirmPassword) {
    return next(new AppError('Miss some input data!', 400));
  }

  if (!validator.isLength(name, { min: 3, max: 30 })) {
    return next(new AppError('Name should be from 3-30 characters!'), 400);
  }

  if (!validator.isEmail(email)) {
    return next(new AppError('Email is invalid!'), 400);
  }

  const results = await queryPromise('SELECT * FROM users WHERE email = ?', [email]);

  if (results.length !== 0) {
    return next(new AppError('This email is already existed!', 400));
  }

  if (confirmPassword !== password) {
    return next(new AppError('Password and confirm password is not matched!', 400));
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Save new user to database
  await queryPromise('INSERT INTO users(name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);

  // Create new user's data folder
  const { root } = req.vars;
  const userDir = `${root}/users/${email}`;

  await promisify(fs.mkdir)(userDir);

  // Return response to client
  return res.status(201).json({
    title: 'success',
    message: 'Create new user successfully',
    data: {
      name,
      email
    }
  });
});

const login = catchAsync(async (req, res, next) => {

  const { email, password } = req.body;

  // Validation input
  if (!email || !password) {
    return next(new AppError('Miss some input data!', 400));
  }

  const results = await queryPromise('SELECT * FROM users WHERE email = ?', [email]);
  const user = results[0];

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError('Wrong email or password!', 401));
  }

  // Unselect user's password (for security)
  delete user['password'];

  // Store user's data folder path
  user.userRoot = path.join(req.vars.root, `/users/${email}`);

  // Session storage
  req.session.authenticated = true;
  req.session.user = user;

  return res.status(200).json({
    status: 'success',
    message: 'Login successfully',
    data: user
  });
});

const isAuthenticated = (req, res, next) => {
  if (req.session.authenticated) {
    return next();
  }
  req.flash('message', { text: 'You are not logged in yet!', type: 'warning' });
  res.redirect('/login');
}

const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/login');
};

const isLoggedIn = (req, res, next) => {
  if (!req.session.authenticated) {
    return next();
  }
  res.redirect('/home');
}

// EXPORT LOGICS
module.exports = {
  register,
  login,
  isAuthenticated,
  logout,
  isLoggedIn
}

