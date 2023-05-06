const fs = require('fs');
const { promisify } = require('util');
const path = require('path');
const multer = require('multer');
const { fileTypes, fileIcons, formatBytes } = require('./supportFiles');
const catchAsync = require('../utils/catchAsync');

exports.directoryExists = async (path) => {
  try {
    await promisify(fs.access)(path, fs.constants.F_OK);
    return true;
  } catch (error) {
    return false;
  }
};

// This middleware is referenced at: 
// https://stackoverflow.com/questions/30448002/how-to-get-directory-size-in-node-js-without-recursively-going-through-directory
// Authors: Inigo, Andrew Odri
exports.getDirSize = async dir => {
  const files = await promisify(fs.readdir)(dir, { withFileTypes: true });

  const paths = files.map(async file => {
    const p = path.join(dir, file.name);

    if (file.isDirectory()) return await getDirSize(p);

    if (file.isFile()) {
      const { size } = await promisify(fs.stat)(p);

      return size;
    }

    return 0;
  });

  return (await Promise.all(paths)).flat(Infinity).reduce((i, size) => i + size, 0);
}

// These following middlewares are referenced at: 
// Source: https://www.youtube.com/playlist?list=PLu1AuqcHccUhbi-qjH2g8qX8i4VEY5mQj
// Author: Mai Van Manh

// This function used to load all files or folders 
// userRoot: User's data folder path
// location: Specific file's or folder's location (location = userRoot + file's or folder's name)
// Ex: location = user@gmail.com/TestFolder
exports.load = (userRoot, location) => {
  return new Promise(async (resolve, reject) => {
    let files = await promisify(fs.readdir)(location);
    let result = [];

    // Retrieve all files or folders info
    for (const file of files) {
      // Hide file start with . (Ex: .git, .vscode)
      if (file.startsWith('.')) {
        continue;
      }

      const name = file;
      const filePath = path.join(location, name);
      const stats = await promisify(fs.stat)(filePath);
      const ext = path.extname(name);
      const type = fileTypes[ext] || 'Other file';
      const icon = fileIcons[ext] || '<i class="fa-solid fa-file"></i>';
      const subPath = filePath.replace(userRoot, '');

      result.push({
        name,
        path: filePath,
        subPath,
        isDirectory: stats.isDirectory(),
        size: stats.isDirectory() ? formatBytes(await this.getDirSize(filePath)) : formatBytes(stats.size),
        lastModified: new Date(stats.mtime).toLocaleString('en-us', { timeZone: 'Asia/Jakarta' }),
        type,
        icon,
      });
    }

    resolve(result);
  });
}

exports.getCurrentDir = catchAsync(async (req, res, next) => {
  const { userRoot } = req.session.user;
  let dir = req.query.dir ?? ''; // Ex: localhost:3000/home?dir=TestFolder
  let currentDir = path.join(userRoot, dir);

  // Check the dir is existed or not
  // Ex: userRoot   = /users/user@gmail.com; dir = TestFolder
  // =>  currentDir = /users/user@gmail.com/TestFolder ?? /users/user@gmail.com/
  if (!(await this.directoryExists(currentDir))) {
    currentDir = userRoot;
  }

  // Read files or folders in current dir
  const files = await this.load(userRoot, currentDir);

  // Save to req vars
  req.vars.currentDir = currentDir;
  req.vars.files = files;

  // Call next middleware
  next();
});

exports.uploader = multer({ dest: '/uploads/' });
