const fs = require('fs');
const express = require('express');
const { getDirSize } = require('../utils/fileReader');

const router = express.Router();

const getFiles = async (req, res) => {
  try {
    const path = 'C:\\Users\\ACER\\Desktop\\NodeJS\\ThucHanh\\Lab06-07\\src\\users\\conan@gmail.com\\Video\\';
    const size = await getDirSize(path);
    console.log('size:', size);
    res.send('Processing...');
  } catch (error) {
    console.log(error);
  }

};

router 
  .route('/') 
  .get(getFiles);

module.exports = router;