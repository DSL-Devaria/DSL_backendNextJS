import type { NextApiRequest, NextApiResponse } from "next"
import type { RespostaPadraoMsg } from "@/types/respostaPadraoMsg"
import type { CadastroUsusarioRequisicao } from "@/types/CadastroUsuarioRequisicao";
import  {conectarBancoDB} from '../../middlewares/conectaBancoDB'
import {UsuarioModel} from '../../models/usuarioModel'
import bcrypt from 'bcrypt'

const endpointCadastro = async (
    req: NextApiRequest,
    res: NextApiResponse<RespostaPadraoMsg>) => {

    if (req.method === 'POST') {
        const usuario = req.body as CadastroUsusarioRequisicao
        if (!usuario.nome || usuario.nome.length < 2) {
            return res.status(400).json({ erro: 'Nome não é válido' })
        }
        const validarEmail = (email: string): boolean => {
            const emailRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            return email.match(emailRegex) !== null
        }
        const IssoEvalido: boolean = validarEmail(usuario.email)

        if (!IssoEvalido) {
            return res.status(400).json({ erro: 'E-mail não é válido!' })
        }
        
        if (!usuario.senha || usuario.senha.length < 4) {
            return res.status(400).json({ erro: 'Senha não é válida!' })
        }
        if (!usuario.autentique || usuario.autentique.length < 10){
            return res.status(400).json({ erro: 'Token Autentique não é válido!' })
        }
        const usuarioComMesmoEmail = await UsuarioModel.find({email: usuario.email})
        if(usuarioComMesmoEmail && usuarioComMesmoEmail.length > 0){
            return res.status(400).json({ erro: 'Já existe uma conta com este endereço de e-mail.' })
        }
        
        //  salvar No banco de dados
        try{
            const hashedPassword = await bcrypt.hash(usuario.senha, 10);
            
            const  salvarUsuario = {
                nome:usuario.nome,
                email:usuario.email,
                senha: hashedPassword,
                autentique:usuario.autentique
               
            }
            await UsuarioModel.create(salvarUsuario)
            return res.status(200).json({msg: 'Usuário criado com sucesso'})
        }catch(erro){
            console.log('Erro ao criar usuário no banco de dados:', erro);
            return res.status(500).json({ erro: 'Erro interno do servidor' });
        }

    }
    return res.status(405).json({erro : 'Métodos relatados inválidos'})
}
export default conectarBancoDB(endpointCadastro)