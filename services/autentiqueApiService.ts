import axios from "axios";

export default class AutentiqueApiService {
    axios: any;
    constructor() {
        this.axios = axios.create({
            timeout: 1000,
            baseURL: process.env.AUTENTIQUE_URL
          
        });
    }


    post( token:any, data: any) {
        this.axios.interceptors.request.use((config: { headers: { Authorization: string; }; }) => {
            if (token) {
                config.headers.Authorization = 'Bearer ' + token
            }
            return config;
        })
        return this.axios.post('/graphql', data,{
            processData: false,
            withCredentials: true,
            cache: false,
            headers: {
              'Content-Type': 'application/json'
            }});
    }

    
    postData(token:any,data: any) {
        this.axios.interceptors.request.use((config: { headers: { Authorization: string; }; }) => {
            if (token) {
                config.headers.Authorization = 'Bearer ' + token
            }
            return config;
        })
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



