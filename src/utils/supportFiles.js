exports.fileTypes = {
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

exports.fileIcons = {
  '': '<i class="fas fa-folder"></i>',
  '.doc': '<i class="fas fa-file-word"></i>',
  '.docx': '<i class="fas fa-file-word"></i>',
  '.zip': '<i class="fas fa-file-archive"></i>',
  '.rar': '<i class="fas fa-file-archive"></i>',
  '.txt': '<i class="fas fa-file-alt"></i>',
  '.jpg': '<i class="fas fa-file-image"></i>',
  '.png': '<i class="fas fa-file-image"></i>',
  '.mp4': '<i class="fas fa-file-video"></i>',
  '.pdf': '<i class="fas fa-file-pdf"></i>',
  '.pptx': '<i class="fas fa-file-powerpoint"></i>'
};

exports.formatBytes = (bytes, decimals = 2) => {
  if (bytes == 0) return '-';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']; 
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}