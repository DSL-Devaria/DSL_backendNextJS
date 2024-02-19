import { politicaCORS } from "@/middlewares/politicaCORS";
import { RespostaPadraoMsg } from "@/types/respostaPadraoMsg";
import { NextApiRequest, NextApiResponse } from "next";
import Ably from 'ably'

const endpointAutentique = async (
    req: NextApiRequest,
    res: NextApiResponse<RespostaPadraoMsg | any>) => {



    if (req.method === 'POST') {
        const WebhookData = JSON.parse(JSON.stringify(req.body))
        console.log('webhook', WebhookData)
        console.log('webhook teste docID', WebhookData.documento.uuid)

        

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
