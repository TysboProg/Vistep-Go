import axios from "axios";

export class IndexService {
    //  здесь будут описаны подключение к эндпоинтам примерно как показано снизу
    static async getUsers(): Promise<IUsers[] | undefined> {
        try {
            const response = await axios.get("https://dummyjson.com/users", {
                withCredentials: true
            })
            return response.data;
        } catch (error) {
            console.error(error);
        }
    }
}