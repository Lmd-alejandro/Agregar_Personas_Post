const validarToken = (req, res,) => {
    const { token } = req.body;
    if(!token){
        return res.status(403).json({msg: "No se proporciona"})
}}
module.exports = validarToken;

