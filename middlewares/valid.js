    
     const validarCuerpo = async (req, res, next) => {
        const { email, password, name, phone } = req.body
        if (!email || !password || !name || !phone) {
          return res.status(400).json({ error: "Haz dejado 1 o mas campos  sin completar recuerda que es contraseña email nombre y telefono" })
        }
        next();
      }
module.exports = validarCuerpo;