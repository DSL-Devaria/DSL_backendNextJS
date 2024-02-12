import { politicaCORS } from "@/middlewares/politicaCORS";
import { RespostaPadraoMsg } from "@/types/respostaPadraoMsg";
import { NextApiRequest, NextApiResponse } from "next";

const endpointAutentique = async (
    req: NextApiRequest,
    res: NextApiResponse<RespostaPadraoMsg | any>) => {



    if (req.method === 'POST') {
        const WebhookData= JSON.stringify(req.body)
        console.log('webhook', WebhookData)
        return res.status(200).json(WebhookData)
    }}

    export default politicaCORS(endpointAutentique)