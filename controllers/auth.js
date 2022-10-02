const auth = async(req, res) =>{
  try {
    res.render('pages/auth', {
      layout: 'nohead'
    })
  } catch (error) {
    console.log(error);
  }
}

const login = async(req, res) =>{
  try {
    let {username, password} = req.body
    if(username == 'admin' && password == '123'){
      req.session.isAuthed = true
      return res.redirect('/')
    }
    return res.redirect('/auth')
  } catch (error) {
    console.log(error);
  }
}

const logout = async(req, res) =>{
  req.session.destroy(error =>{
    if(error){
      console.log(error);
    }
    res.redirect('/auth')
  })
}

module.exports = { auth, login, logout }