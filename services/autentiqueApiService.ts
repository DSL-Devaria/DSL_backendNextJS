import  axios  from "axios";

export default class autentiqueApiService {
    constructor() {
        this.axios = axios.create({
            baseURL: process.env.AUTENTIQUE_URL
        });
        this.axios.interceptors.request.use((config) => {
            const token = process.env.AUTENTIQUE_TOKEN;
            if (token) {
                config.headers.Authorization = 'Bearer ' + token
            }
            return config;
        })
       
    }
    post(data) {
        return this.axios.post( data);
    }
}
