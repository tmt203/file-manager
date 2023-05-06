const path = require('path');
const fs = require('fs-extra');
const { promisify } = require('util');
const archiver = require('archiver')
const { rimraf } = require('rimraf');
const AppError = require("../utils/appError");
const { directoryExists } = require('../utils/fileReader');
const catchAsync = require('../utils/catchAsync');

module.exports = {
  // This middleware is used to upload file (only 1 file now).
  // If user upload a duplicate file then it will be override by the new one.
  uploadFiles: catchAsync(async (req, res, next) => {
    // Get email and currentPath from request body
    // email:       to identify user data storage folder
    // currentPath: to identify current dir path the user is in
    const { email, currentPath } = req.body;
    // Get uploaded file from uploader middleware
    const file = req.file;

    // Check input missing
    if (!email || !currentPath || !file) {
      return next(new AppError('Invalid information', 403));
    }

    // Check the current path from root is exist
    if (!(await directoryExists(currentPath))) {
      return next(new AppError('The path to save does not exist', 404));
    }

    let name = file.originalname;
    let newPath = path.join(currentPath, name);

    // Copy file from "uploads" to "newPath"
    fs.renameSync(file.path, newPath);

    res.status(201).json({
      status: 'success',
      message: 'Upload file successfully',
      data: file
    });
  }),

  createFolder: catchAsync(async (req, res, next) => {
    // Get folder's name and current diretory from request body
    const { folderName, currentDir } = req.body;

    // Check missing input
    if (!folderName || !currentDir) {
      return next(new AppError('Missing folder name or current directory!', 400));
    }

    // New directory to create
    const newDir = path.join(currentDir, folderName);

    // Check new directory is exist or not
    if ((await directoryExists(newDir))) {
      return next(new AppError('This folder alreaady exist in the current directory!', 400));
    }

    // Create new directory if it not exist
    await promisify(fs.mkdir)(newDir);
    res.status(201).json({
      status: 'success',
      message: 'Create a new directory successfully'
    });
  }),

  createTextFile: catchAsync(async (req, res, next) => {
    // Get file's name and current directory from request body
    const { fileName, content, currentDir } = req.body;

    // Check missing input
    if (!fileName || !currentDir) {
      return next(new AppError(`Missing file's name or current directory!`, 400));
    }

    // New file path to create
    const newFilePath = path.join(currentDir, fileName);

    // Create file or overwrite if it already exist
    await promisify(fs.writeFile)(newFilePath, content);

    res.status(201).json({
      status: 'success',
      message: 'Create new text file or overwritten successfully'
    });
  }),

  downloadFile: (req, res, next) => {
    // Get the file's path from request query
    const { filePath } = req.query;

    // Check missing input
    if (!filePath) {
      return next(new AppError('There is no file to download!', 404));
    }

    // Download file
    res.download(filePath);
  },

  downloadFolder: (req, res, next) => {
    try {
      // Get folder path from request query
      const { folderPath } = req.query;

      // Check missing input
      if (!folderPath) {
        return next(new AppError('Missing folder path!', 404));
      }

      // Create a file to stream data to
      const folderName = folderPath.split('\\').pop() + '.zip';
      const output = fs.createWriteStream(folderName); // Ex: Document.zip will created at root folder of the project (Need to be deleted after download)
      const archive = archiver('zip', { zlib: { level: 9 } });

      // Listen for all archive data to be written
      // 'close' event is fired only when a file descriptor is involved
      output.on('close', () => {
        res.download(folderName, async (err) => {
          if (err) {
            console.error('Error downloading folder: ', err);
          } else {
            console.log('File download successfully');
            // Remove the zip file the root directory after download it
            await promisify(fs.remove)(folderName);
          }
        });
      });

      // Catch warning (ie stat failures or other non-blocking errors)
      archive.on('warning', err => {
        if (err.code === 'ENOENT') {
          console.warn('File not found or permission denied: ', err);
        } else {
          throw err;
        }
      });

      // Catch error
      archive.on('error', err => {
        console.log('Error creating archive: ', err);
        res.status(500).send('Error creating archive');
      });

      // Pipe archive data to the file
      archive.pipe(output);

      // Append files from a sub-directory, putting its contents at the root of archive
      archive.directory(folderPath, false);

      // Finalize the archive (ie we are done appending files but streams have to finish yet)
      // 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
      archive.finalize();
    } catch (error) {
      next(error);
    }
  },

  editFileName: catchAsync(async (req, res, next) => {
    // Get current directory, current file name and new file name from request body
    const { currentDir, currentFileName, newFileName } = req.body;

    // Check missing input
    if (!currentDir || !currentFileName || !newFileName) {
      return next(new AppError('Missing some input!', 404));
    }

    // If there is no change in file name then return
    if (currentFileName === newFileName) {
      return res.status(204);
    }

    // Update file name
    const currentFilePath = path.join(currentDir, currentFileName);
    const newFilePath = path.join(currentDir, newFileName);

    await promisify(fs.rename)(currentFilePath, newFilePath);

    res.status(200).json({
      status: 'success',
      message: 'Edit file name successfully'
    })
  }),

  delete: catchAsync(async (req, res, next) => {
    // Get current directory and file name
    const { path } = req.body;

    // Check missing input
    if (!path) {
      return next(new AppError('Missing input data!', 404));
    }

    // Check path is exist or not
    if (!(await directoryExists(path))) {
      return next(new AppError('This path is not exist!', 404));
    }

    // Remove path if it exist
    await rimraf(path, { disableGlob: true });
    
    return res.status(200).json({
      status: 'success',
      message: 'Path deleted successfully'
    });
  }),

  /* This method cause EPERM error
  // Because the directory you're trying to move or rename is not currently open 
  // or in use by any other programs or processes.
  */
  /*
  editFolderName: catchAsync(async (req, res, next) => {
    // Get current directory, current file name and new file name from request body
    const { currentDir, currentFolderName, newFolderName } = req.body;

    // Check missing input
    if (!currentDir || !currentFolderName || !newFolderName) {
      return next(new AppError('Missing some input!', 404));
    }

    // If there is no change in file name then return
    if (currentFolderName === newFolderName) {
      return res.status(204);
    }

    // Update file name
    const currentFilePath = path.join(currentDir, currentFolderName);
    const newFilePath = path.join(currentDir, newFolderName);

    console.log('Current path:', currentFilePath);
    console.log('New path:', newFilePath);

    await promisify(fs.move)(currentFilePath, newFilePath);

    console.log('Chn')
    res.status(200).json({
      status: 'success',
      message: 'Edit file name successfully'
    })

  }),
  */
};