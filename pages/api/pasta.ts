import type { NextApiRequest, NextApiResponse } from "next";
import type { RespostaPadraoMsg } from "@/types/respostaPadraoMsg";
import { createRouter } from 'next-connect';
import AutentiqueApiService from "@/services/autentiqueApiService";
import fs from 'fs';
import utils from '@/autentique/resources/utils'
import multer from 'multer';
import { UsuarioModel } from "@/models/usuarioModel";
import { validarTokenJwt } from "@/middlewares/validarTokenJWT";
import { conectarBancoDB } from "@/middlewares/conectaBancoDB";
import { politicaCORS } from "@/middlewares/politicaCORS";

const AutentiqueService = new AutentiqueApiService();

// só para poder usar o use e portanto o form data do multer... tem jeito melhor?
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


const router = createRouter<NextApiRequest | any, NextApiResponse | any>()
  .use(upload.single('file'))

  .post(async (req: NextApiRequest | any, res: NextApiResponse<RespostaPadraoMsg | any>) => {
    try {
      const { userId } = req.query;
      const usuarioLogado = await UsuarioModel.findById(userId);
      if (!usuarioLogado) {
        return res.status(400).json({ erro: 'Usuario não encontrado!' })
      }
      const token = usuarioLogado.autentique;
      const { folderName } = req?.body;

      const variables = {
        folder: {
          name: folderName
        }

      }

      const filename = `./autentique/resources/folders/create.graphql`
      const operations = fs.readFileSync(filename)
        .toString()
        .replace(/[\n\r]/gi, '')
        .replace('$variables', JSON.stringify(variables))

      const formData = (utils.query(operations))


      const response = await AutentiqueService.post(token, formData);
      return res.status(200).json(response.data)

    } catch (e) {
      console.log(e);
      return res.status(400).json({ erro: 'Não foi possivel criar a pasta' });
    }

  })

  .get(async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg | any>) => {
    try {
      const { userId } = req.query;
      const usuarioLogado = await UsuarioModel.findById(userId);
      if (!usuarioLogado) {
        return res.status(400).json({ erro: 'Usuario não encontrado!' })
      }
      const token = usuarioLogado.autentique;
      const { pastaId, page } = req?.query;

      const filename = pastaId ? './autentique/resources/folders/listById.graphql' : './autentique/resources/folders/listAll.graphql';

      const operations = fs.readFileSync(filename)
        .toString()
        .replace(/[\n\r]/gi, '')
        .replace('$page', page ? page : '1')
        .replace('$folderId', pastaId)

      const formData = (utils.query(operations))



      const response = await AutentiqueService.post(token, formData);
      return res.status(200).json(response.data);//{msg: 'Usuario autenticado com sucesso'});

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
      const { docId, pastaId } = req?.query;

      const filename = './autentique/resources/folders/moveDocumentById.graphql'
      const operations = fs.readFileSync(filename)
        .toString()
        .replace(/[\n\r]/gi, '')
        .replace('$folderId', pastaId)
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
      const { pastaId } = req?.query;

      const filename = './autentique/resources/folders/deleteById.graphql'
      const operations = fs.readFileSync(filename)
        .toString()
        .replace(/[\n\r]/gi, '')
        .replace('$folderId', pastaId)
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