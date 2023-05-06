$(document).ready(() => {
  const renderMessage = (message) => {
    $('#flash-message').removeClass('d-none');
    $('#flash-message .alert').addClass('alert-danger');
    $('#flash-message span').text(message);
  }

  const fileTypes = {
    '': 'Folder',
    '.doc': 'Microsoft Office Word',
    '.docx': 'Microsoft Office Word',
    '.zip': 'Compressed File',
    '.rar': 'Compressed RAR File',
    '.txt': 'Text Document',
    '.jpg': 'JPEG File',
    '.png': 'JPEG File',
    '.mp4': 'MP4 Video',
    '.pdf': 'PDF Document',
    '.pptx': 'Microsoft Powerpoint'
  };

  // Login form submit
  $('#login-form').submit(function (e) {
    e.preventDefault();

    const formData = new FormData(this);

    $.ajax({
      url: '/api/users/login',
      method: 'POST',
      data: Object.fromEntries(formData),
      success: (res) => {
        window.location.href = '/home';
      },
      error: (xhr, status, error) => {
        renderMessage(xhr.responseJSON.message);
      }
    });
  });

  // Register form submit
  $('#register-form').submit(function (e) {
    e.preventDefault();

    const formData = new FormData(this);

    $.ajax({
      url: '/api/users/register',
      method: 'POST',
      data: Object.fromEntries(formData),
      success: (res) => {
        window.location.href = '/login';
      },
      error: (xhr, status, error) => {
        renderMessage(xhr.responseJSON.message);
      }
    });
  });

  // File Validation
  $(".custom-file-input").on("change", function () {
    // Get the file information
    const fileName = $(this).val().split("\\").pop();
    const fileExtension = "." + fileName.split(".").pop();
    const fileSize = this.files[0].size / 1024 / 1024 // File size in MB 

    // Check invalid file extension 
    if (fileTypes[fileExtension] === undefined) {
      return alert('This file extension is not supported!');
    }

    // Check file size should not exceed 20MB
    if (fileSize > 20) {
      return alert('File size must not exceed 20MB');
    }

    // The name of the file appear on select
    $(this).siblings(".custom-file-label").addClass("selected").html(fileName);
  });

  // Upload file form submit
  $('#upload-form').submit(function (e) {
    e.preventDefault();

    const files = $(this).find('#attachment').prop("files");
    const formData = new FormData(this);

    if (files.length === 0) {
      return alert('Please choose a file');
    }

    $.ajax({
      xhr: function () {
        const xhr = new window.XMLHttpRequest();

        // Display progress bar
        $('#progress-bar-container').removeClass('d-none');

        // Disable "Upload File" button
        $('#upload-form button').attr('disabled', true);

        // Track progress of upload file
        xhr.upload.addEventListener("progress", function (evt) {
          if (evt.lengthComputable) {
            let percentComplete = Math.round(evt.loaded * 100 / evt.total);

            // Update percentage on progress bar
            $('.progress-bar').width(percentComplete + '%');

            if (percentComplete === 100) {
              // Hide progress bar
              $('#progress-bar-container').addClass('d-none');

              // Enable "Upload File" button
              $('#upload-form button').removeAttr('disabled');
            }

          }
        }, false);

        return xhr;
      },
      url: '/api/files/upload',
      method: 'POST',
      processData: false,
      contentType: false,
      data: formData,
      success: (res) => {
        console.log('Upload successfully');
        $('.custom-file-label').html('');
        window.location.reload();
      },
      error: (xhr, status, error) => {
        console.log('Upload failed!');
        console.log(xhr.responseJSON.message);
      }
    });
  });

  // New folder form submit
  $('#newFolderForm').submit(function (e) {
    e.preventDefault();

    const formData = new FormData(this);

    $.ajax({
      url: '/api/files/createFolder',
      method: 'POST',
      data: Object.fromEntries(formData),
      success: (res) => {
        window.location.reload();
      },
      error: (xhr, status, error) => {
        alert(xhr.responseJSON.message);
      }
    });
  });

  // New file form submit
  $('#newFileForm').submit(function (e) {
    e.preventDefault();

    const formData = new FormData(this);

    $.ajax({
      url: '/api/files/createTextFile',
      method: 'POST',
      data: Object.fromEntries(formData),
      success: (res) => {
        window.location.reload();
      },
      error: (xhr, status, error) => {
        alert(xhr.responseJSON.message);
      }
    });
  });

  // Rename file form dialog show up
  $('#confirm-rename').on('show.bs.modal', function (e) {
    const name = $(e.relatedTarget).data('name');
    // Set name to form's fields
    $(this).find('strong').text(name);
    $(this).find('.modal-body input').val(name);
    $(this).find('input[name=currentFileName]').val(name);
  });

  // Rename file form submit
  $('#rename-form').submit(function (e) {
    e.preventDefault();

    const formData = new FormData(this);

    $.ajax({
      url: '/api/files/editFileName',
      method: 'PATCH',
      data: Object.fromEntries(formData),
      success: (res) => {
        window.location.reload();
      },
      error: (xhr, status, error) => {
        console.log(xhr.responseJSON);
      }
    });
  });

  // Confirm delete file modal show up
  $('#confirm-delete').on('show.bs.modal', function (e) {
    // Get file name
    const name = $(e.relatedTarget).data('name');
    const path = $(e.relatedTarget).data('path');

    // Set to form's fields
    $(this).find('strong').text(name);
    $(this).find('input').val(path);
  });

  // Delete file form submit
  $('#delete-form').submit(function (e) {
    e.preventDefault();

    const formData = new FormData(this);

    $.ajax({
      url: '/api/files/',
      method: 'DELETE',
      data: Object.fromEntries(formData),
      success: (res) => {
        window.location.reload();
      },
      error: (xhr, status, error) => {
        console.log(xhr.responseJSON);
      }
    });
  });
})
