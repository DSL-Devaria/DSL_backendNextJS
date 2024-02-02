import mongoose, {Schema} from "mongoose"

const UsuarioSchema = new Schema({
    nome: {type: String, require: true},
    email: {type: String, require: true},
    senha: {type: String, require: true},
    dataNascimento: {type: String, require: true},
    sexo: {type: String, require: true},
    autentique: {type: String, require: true}
})

export const UsuarioModel =  (mongoose.models.usuarios || 
    mongoose.model('usuarios' , UsuarioSchema))