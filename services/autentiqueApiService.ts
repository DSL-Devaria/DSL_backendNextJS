import axios from "axios";

export default class AutentiqueApiService {
 
    axios: any;
    constructor() {
        this.axios = axios.create({
            timeout: 1000,
            baseURL: process.env.AUTENTIQUE_URL
        });
        this.axios.interceptors.request.use((config: { headers: { Authorization: string; }; }) => {
            const token = process.env.AUTENTIQUE_TOKEN;
            if (token) {
                config.headers.Authorization = 'Bearer ' + token
            }
            return config;
        })

    }
    post(data: any) {
        return this.axios.post('/graphql', data,{
            processData: false,
            withCredentials: true,
            cache: false,
            headers: {
              'Content-Type': 'application/json'
            }});
    }
    postData(data: any) {
        return this.axios.post('/graphql', data,{
            processData: false,
            withCredentials: true,
            cache: false,
            headers: {
                
                enctype: 'multipart/form-data',
                'content-type': `multipart/form-data; `,
                Accept: 'application/json'
            }});
    }

}



