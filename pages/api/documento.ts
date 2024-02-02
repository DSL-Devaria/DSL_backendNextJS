import type { NextApiRequest, NextApiResponse } from "next";
import type { RespostaPadraoMsg } from "@/types/respostaPadraoMsg";
import multer from 'multer';
import { createRouter } from 'next-connect';
import AutentiqueApiService from "@/services/autentiqueApiService";
import fs from 'fs';
import utils from '@/autentique/resources/utils'
import axios from "axios";
import FormData from "form-data";

const storage = multer.memoryStorage();
const AutentiqueService = new AutentiqueApiService();

const upload = multer({ storage: storage });

const router = createRouter<NextApiRequest | any, NextApiResponse | any>()
  .use(upload.single('file'))
  
  /* para usar o sdk do thigo instalar e importar:

  import autentique from '@thiago.zampieri/autentique-v2-nodejs';
  
  .post(async (req: NextApiRequest | any, res: NextApiResponse<RespostaPadraoMsg | any>) => {
     try {
       const { AUTENTIQUE_TOKEN, AUTENTIQUE_DEV_MODE } = process.env;
       autentique.token = AUTENTIQUE_TOKEN;
       autentique.sandbox = AUTENTIQUE_DEV_MODE;
       const { signers, docName, fileUrl } = req.body;
 
       const attributes = {
         document: { name: docName },
         signers: signers,
         filename: req?.file?.originalname,
         file: req?.file?.buffer
       }
       
       const responseCreate = await autentique.document.create(attributes);
       return res.status(200).json(responseCreate)
     } catch (e) {
       console.log(e);
       return res.status(400).json({ erro: 'Não foi possivel cadastrar documento' });
     }
 
   })
   */

  .post(async (req: NextApiRequest | any, res: NextApiResponse<RespostaPadraoMsg | any>) => {
    try {
      // para teste
      const { AUTENTIQUE_DEV_MODE } = process.env;
      const sandbox = AUTENTIQUE_DEV_MODE;

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

      const response = await AutentiqueService.postData(formData);
      console.log('resposta', response)

      return res.status(response.status).json(response.data)
    } catch (e) {
      console.log(e);
      return res.status(400).json({ erro: 'Não foi possivel cadastrar documento' });
    }

  })

  .get(async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg | any>) => {
    try {

      // para testes
      const { AUTENTIQUE_DEV_MODE } = process.env;
      const sandbox = AUTENTIQUE_DEV_MODE;

      //const usuario = await UsuarioModel.findById(userId);

      const { pastaId, docId, page } = req?.query;


      const filename = docId ? './autentique/resources/documents/listById.graphql' : (pastaId ? './autentique/resources/folders/listDocumentsById.graphql' : './autentique/resources/documents/listAll.graphql');

      const operations = fs.readFileSync(filename)
        .toString()
        .replace(/[\n\r]/gi, '')
        .replace('$page', page ? page : '1')
        .replace('$documentId', docId)
        .replace('$folderId', pastaId)
        .replace('$sandbox', sandbox.toString())
      const formData = (utils.query(operations))

      console.log('file name: ', formData)

      const response = await AutentiqueService.post(formData);
      console.log('resposta', response)
      return res.status(200).json(response.data);

    } catch (e) {
      console.log(e);
      return res.status(400).json({ erro: 'Não foi possivel obter lista de documentos' });
    }

  })

  .put(async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg | any>) => {
    try {
      const { docId } = req?.query;

      const filename = './autentique/resources/documents/signById.graphql'
      const operations = fs.readFileSync(filename)
        .toString()
        .replace(/[\n\r]/gi, '')
        .replace('$documentId', docId)
      const formData = (utils.query(operations))
      console.log('file name: ', formData)

      const response = await AutentiqueService.post(formData);
      return res.status(200).json(response.data);

    } catch (e) {
      console.log(e);
      return res.status(400).json({ erro: 'Não foi possivel obter dados do usuario' });
    }
  })

  .delete(async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg | any>) => {
    try {
      const { docId } = req?.query;

      const filename = './autentique/resources/documents/deleteById.graphql'
      const operations = fs.readFileSync(filename)
        .toString()
        .replace(/[\n\r]/gi, '')
        .replace('$documentId', docId)
      const formData = (utils.query(operations))


      const response = await AutentiqueService.post(formData);
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

export default router.handler();