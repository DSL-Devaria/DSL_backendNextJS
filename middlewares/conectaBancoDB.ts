import type {  NextApiHandler, NextApiRequest, NextApiResponse} from 'next'
import mongoose from 'mongoose'
import type {RespostaPadraoMsg} from '../types/respostaPadraoMsg'


export const conectarBancoDB = (handler: NextApiHandler) => 
async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg>) => {
    // verificar se o banco ja esta conectado, se estiver seguir para o endpoint
    // para o endpoint ou proximo middleware
    if(mongoose.connections[0].readyState){
        return handler(req, res)
    }

    // ja que nao esta conectado vamos conectar 
    //obter a variavel do ambiente preenchida do env
    
    const {DB_CONEXAO_STRING} = process.env
    
    if(!DB_CONEXAO_STRING){
        return res.status(500).json({erro: 'Env de configuracao do banco de dado, nao informado'})
    }

    mongoose.connection.on('connected' , () => console.log('Banco de dados conectado'))
    mongoose.connection.on('error' , error => console.log(`Ocorreu erro ao conectar no banco:  ${error}`))
    await mongoose.connect(DB_CONEXAO_STRING)
 
    return handler(req, res)

    // agora posso seguir para o endpoint, ja conectado
    

}

