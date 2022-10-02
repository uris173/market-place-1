const getHome = async(req, res) =>{
  try {
    res.render('pages/home', {

    })
  } catch (error) {
    console.log(error);
  }
}


module.exports = { getHome }