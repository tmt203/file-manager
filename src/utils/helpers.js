module.exports = {
  // This function is used to generate folder's path navigation in client
  // currentDir: file's path from root (ex: C:\Users\ACER\Desktop\NodeJS\ThucHanh\Lab06-07\src\users\conan@gmail.com\TestFolder)
  // userRoot:   root folder that contains all data of logged in user (ex: C:\Users\ACER\Desktop\NodeJS\ThucHanh\Lab06-07\src\users\conan@gmail.com)
  navigation: (currentDir, userRoot) => {
    const dirs = currentDir.replace(userRoot, 'Home').split('\\');
    let result = dirs.length > 1 ? `<li class="breadcrumb-item"><a href="/home">Home</a></li>` : '';

    for (let i = 1; i < dirs.length - 1; i++) {
      result += `<li class="breadcrumb-item"><a href="/home?dir=${dirs[i]}">${dirs[i]}</a></li>`;
    }
    result += `<li class="breadcrumb-item active">${dirs[dirs.length - 1]}</li>`;
    return result;
  }
};