import type { NextApiRequest, NextApiResponse } from "next";
import type { RespostaPadraoMsg } from "@/types/respostaPadraoMsg";
import multer from 'multer';
import { createRouter } from 'next-connect';
import AutentiqueApiService from "@/services/autentiqueApiService";
import fs from 'fs';
import utils from '@/autentique/resources/utils'
import axios from "axios";
import FormData from "form-data";
import { validarTokenJwt } from "@/middlewares/validarTokenJWT";
import { conectarBancoDB } from "@/middlewares/conectaBancoDB";
import { UsuarioModel } from "@/models/usuarioModel";
import { politicaCORS } from "@/middlewares/politicaCORS";

const storage = multer.memoryStorage();
const AutentiqueService = new AutentiqueApiService();

const upload = multer({ storage: storage });

const router = createRouter<NextApiRequest | any, NextApiResponse | any>()
  .use(upload.single('file'))
  .post(async (req: NextApiRequest | any, res: NextApiResponse<RespostaPadraoMsg | any>) => {
    try {
      // para teste
      //const { AUTENTIQUE_DEV_MODE } = process.env;
      const sandbox = true;//AUTENTIQUE_DEV_MODE;

      const { userId } = req.query; console.log('userId', userId)
      const usuarioLogado = await UsuarioModel.findById(userId);
      if (!usuarioLogado) {
        return res.status(400).json({ erro: 'Usuario não encontrado!' })
      }
      const token = usuarioLogado.autentique;
      const { signers, docName, fileUrl } = req.body;
      const originalFileName = req?.file?.originalname;

      const variables = {
        document: {
          name: docName.substring(0, 199)
        },
        signers,
        file: null
      }

      const filename = `./autentique/resources/documents/create.graphql`
      const operations = fs.readFileSync(filename)
        .toString()
        .replace(/[\n\r]/gi, '')
        .replace('$variables', JSON.stringify(variables))
        .replace('$sandbox', sandbox.toString())

      let buffer = req?.file?.buffer
      if (fileUrl) {
        const response = await axios.get(fileUrl, { responseType: 'arraybuffer' })
        buffer = Buffer.from(response.data)
      }

      const formData = new FormData()
      formData.append('operations', utils.query(operations))
      formData.append('map', '{"file": ["variables.file"]}')
      formData.append('file', buffer, {
        filename: originalFileName,
        contentType: 'application/octet-stream',
      })

      const response = await AutentiqueService.postData(token, formData);
      return res.status(response.status).json(response.data)

    } catch (e) {
      console.log(e);
      return res.status(400).json({ erro: 'Não foi possivel cadastrar documento' });
    }

  })

  .get(async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg | any>) => {
    try {

      // para testes
      //const { AUTENTIQUE_DEV_MODE } = process.env;
      const sandbox = true;//AUTENTIQUE_DEV_MODE;

      const { userId } = req.query;
      const usuarioLogado = await UsuarioModel.findById(userId);
      if (!usuarioLogado) {
        return res.status(400).json({ erro: 'Usuario não encontrado!' })
      }
      const token = usuarioLogado.autentique;
      const { pastaId, docId } = req?.query;
      let {page} =req?.query;
      if(!page){page='1'}

      const filename = docId ? './autentique/resources/documents/listById.graphql' : 
      (pastaId ? './autentique/resources/folders/listDocumentsById.graphql' : './autentique/resources/documents/listAll.graphql');

      const operations = fs.readFileSync(filename)
        .toString()
        .replace(/[\n\r]/gi, '')
        .replace('$page', page )
        .replace('$documentId', docId)
        .replace('$folderId', pastaId)
        .replace('$sandbox', sandbox.toString())
      const formData = (utils.query(operations))

      const response = await AutentiqueService.post(token, formData);
      return res.status(200).json(response.data);

    } catch (e) {
      console.log(e);
      return res.status(400).json({ erro: 'Não foi possivel obter lista de documentos' });
    }

  })

  .put(async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg | any>) => {
    try {

      const { userId } = req.query;
      const usuarioLogado = await UsuarioModel.findById(userId);
      if (!usuarioLogado) {
        return res.status(400).json({ erro: 'Usuario não encontrado!' })
      }
      const token = usuarioLogado.autentique;
      const { docId } = req?.query;

      const filename = './autentique/resources/documents/signById.graphql'
      const operations = fs.readFileSync(filename)
        .toString()
        .replace(/[\n\r]/gi, '')
        .replace('$documentId', docId)
      const formData = (utils.query(operations))

      const response = await AutentiqueService.post(token, formData);
      return res.status(200).json(response.data);

    } catch (e) {
      console.log(e);
      return res.status(400).json({ erro: 'Não foi possivel obter dados do usuario' });
    }
  })

  .delete(async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg | any>) => {
    try {
      const { userId } = req.query;
      const usuarioLogado = await UsuarioModel.findById(userId);
      if (!usuarioLogado) {
        return res.status(400).json({ erro: 'Usuario não encontrado!' })
      }
      const token = usuarioLogado.autentique;
      const { docId } = req?.query;

      const filename = './autentique/resources/documents/deleteById.graphql'
      const operations = fs.readFileSync(filename)
        .toString()
        .replace(/[\n\r]/gi, '')
        .replace('$documentId', docId)
      const formData = (utils.query(operations))

      const response = await AutentiqueService.post(token, formData);
      return res.status(200).json(response.data);//{msg: 'Usuario autenticado com sucesso'});

    } catch (e) {
      console.log(e);
      return res.status(400).json({ erro: 'Não foi possivel obter dados do usuario' });
    }

  });

export const config = {
  api: {
    bodyParser: false
  }
}

export default politicaCORS(validarTokenJwt(conectarBancoDB(router.handler())));