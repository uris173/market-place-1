module.exports = (req, res, next) =>{
  res.locals.isAuthed = req.session.isAuthed
  next()
}