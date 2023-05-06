$(document).ready(() => {
  // Add the following code if you want the name of the file appear on select
  $(".custom-file-input").on("change", function () {
    var fileName = $(this).val().split("\\").pop();
    $(this).siblings(".custom-file-label").addClass("selected").html(fileName);
  });

  // Start: Upload files
  const uploadFiles = (() => {
    const fileRequests = new WeakMap();
    const defaultOptions = {
      url: '/',
      onAbort() { },
      onError() { },
      onProgress() { },
      onComplete() { },
    };

    const uploadFile = (file, options) => {
      const req = new XMLHttpRequest();
      const formData = new FormData();

      formData.append('file', file, file.name);

      // Do a POST request to URL in ASYNC way
      req.open('POST', options.url, true);

      req.onload = (e) => options.onComplete(e, file);

      req.onerror = (e) => options.onError(e, file);

      req.ontimeout = (e) => options.onError(e, file);

      req.upload.onprogress = (e) => options.onProgress(e, file);

      req.onabort = (e) => options.onAbort(e, file);

      fileRequests.set(file, { request: req, options });

      req.send(formData)
    };

    const abortFileUpload = file => {
      const fileReq = fileRequests.get(file);

      if (fileReq) {
        fileReq.request.abort();
      }
    };

    const clearFileUpload = file => {
      abortFileUpload(file);
      fileRequests.delete(file);
    };

    return (files, options = defaultOptions) => {
      [...files].forEach(file => uploadFile(file, { ...defaultOptions, ...options })); // options will override defaultOptions if have conflicts

      return {
        abortFileUpload,
        clearFileUpload
      };
    };
  })();

  const uploadAndTrackFiles = (() => {
    let uploader = {};
    const FILE_STATUS = {
      PENDING: 'pending',
      UPLOADING: 'uploading',
      PAUSED: 'paused',
      COMPLETED: 'completed',
      FAILED: 'failed'
    };
    const files = new Map();
    const progressBox = document.createElement('div');
    progressBox.className = 'upload-progress-tracker';
    progressBox.innerHTML = `
    <div class="file-progress-wrapper"></div>
  `;

    const filesProgressWrapper = progressBox.querySelector('.file-progress-wrapper')

    const setFileElement = file => {
      const fileElement = document.createElement('div');
      fileElement.className = 'upload-progress-tracker';
      fileElement.innerHTML = `
      <div class="file-details">
        <p><span class="file-name">${file.name}</span> <span class="file-status">${FILE_STATUS.PENDING}</span></p>
        <div class="progress-bar" style="width: 0; height: 10px; background: green;"></div>
      </div>

    `;

      files.set(file, {
        status: FILE_STATUS.PENDING,
        size: file.size,
        percentage: 0,
        fileElement
      });

      filesProgressWrapper.appendChild(fileElement);
    }

    const updateFileElement = fileObj => {
      const [
        { children: [{ children: [, fileStatus] }, progressBar] } // .file-details
      ] = fileObj.fileElement.children;

      requestAnimationFrame(() => {
        fileStatus.textContent = fileObj.status;
        fileStatus.className = `status ${fileObj.status}`;
        progressBar.style.width = fileObj.percentage + '%';
      });
    };

    const onProgress = (e, file) => {
      const fileObj = files.get(file);
      fileObj.status = FILE_STATUS.UPLOADING;
      fileObj.percentage = (e.loaded / e.total) * 100;
      updateFileElement(fileObj);
    };

    const onError = (e, file) => {
      const fileObj = files.get(file);
      fileObj.status = FILE_STATUS.FAILED;
      fileObj.percentage = 100;
      updateFileElement(fileObj);

    };

    const onAbort = (e, file) => {
      const fileObj = files.get(file);
      fileObj.status = FILE_STATUS.PAUSED;
      updateFileElement(fileObj);

    };

    const onComplete = (e, file) => {
      const fileObj = files.get(file);
      fileObj.status = FILE_STATUS.COMPLETED;
      fileObj.percentage = 100;
      updateFileElement(fileObj);

    };

    return (uploadedFiles) => {
      [...uploadedFiles].forEach(setFileElement);

      uploader = uploadFiles(uploadedFiles, {
        url: '/',
        onComplete,
        onAbort,
        onError,
        onProgress
      });

      document.querySelector('#progress-bar-container').appendChild(progressBox);
    };
  })();

  $('#form-file-upload').on('submit', function (event) {
    // Prevent submit form
    event.preventDefault();

    // Get all uploading files
    const files = $(this).find('input[type="file"]')[0].files;
    console.log('files:', files);
    uploadAndTrackFiles(files);
  });
  // End: Upload files
});