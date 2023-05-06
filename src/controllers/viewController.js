module.exports = {
  registerPage: (req, res) => {
    res.render('register', {
      title: 'Register Page',
      styleFile: 'login.css',
    });
  },
  loginPage: (req, res) => {
    res.render('login', {
      title: 'Login Page',
      styleFile: 'login.css',
      message: req.flash('message')[0]
    });
  },
  homePage: (req, res) => {
    res.render('home', {
      title: 'Home Page',
      styleFile: 'home.css',
      user: req.session.user,
      currentDir: req.vars.currentDir,
      files: req.vars.files
    });
  }
};