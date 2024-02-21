import { politicaCORS } from "@/middlewares/politicaCORS";
import { RespostaPadraoMsg } from "@/types/respostaPadraoMsg";
import { NextApiRequest, NextApiResponse } from "next";
import Ably from 'ably'
import url from 'querystring'

const endpointAutentique = async (
    req: NextApiRequest,
    res: NextApiResponse<RespostaPadraoMsg | any>) => {

        function transformToJSON(data) {
            let result = {};
        
            for (let key in data) {
                let keys = key.split('[').map(k => k.replace(']', ''));
                let current = result;
        
                for (let i = 0; i < keys.length; i++) {
                    let keyPart = keys[i];
                    if (!(keyPart in current)) {
                        if (i < keys.length - 1 && !isNaN(keys[i + 1])) {
                            current[keyPart] = [];
                        } else {
                            current[keyPart] = {};
                        }
                    }
                    if (i === keys.length - 1) {
                        current[keyPart] = data[key];
                    } else {
                        current = current[keyPart];
                    }
                }
            }
        
            return JSON.stringify(result, null, 4);
        }


    if (req.method === 'POST') {
        const WebhookData = JSON.parse(transformToJSON(req.body))
        const WebhookDataSimplificada = {
            partes:[],
            documento:{
                id: WebhookData.documento.uuid,
                nome:WebhookData.documento.nome,
                publicado:WebhookData.documento.publicado,
                updated:WebhookData.documento.updated

            },
            remetente:{
                nome: WebhookData.remetente.nome,
                email: WebhookData.remetente.email
            },
            arquivo:{
                original:WebhookData.arquivo.original,
                assinado:WebhookData.arquivo.assinado
            },
        };
        WebhookData.partes.forEach(parte => {
            WebhookDataSimplificada.partes.push({
                id:parte.uuid,
                nome:parte.nome,
                email:parte.email,
                ordem:parte.ordem,
                funcao: parte.funcao,
                mail:parte.mail,
                visualizado:parte.visualizado?.created,
                assinado:parte.assinado?.created,
            })
        });
       
        //console.log('webhook', WebhookDataSimplificada)

        

        // --------ABLY---------------
        const { ABLY_API_KEY } = process.env;
        const ably = new Ably.Realtime.Promise(`${ABLY_API_KEY}`);

        await ably.connection.once("connected");
        console.log("Connected to Ably!");

        // get the channel to subscribe to
        const channel = ably.channels.get("autentique");

        await channel.subscribe("webhook", (message) => {
            console.log("you recive this update webhook ==> " + message.data);
        });

        // Publish a message or two
        await channel.publish("webhook", WebhookData);
        

        return res.status(200).json(WebhookData)
    }
}

export default politicaCORS(endpointAutentique)
