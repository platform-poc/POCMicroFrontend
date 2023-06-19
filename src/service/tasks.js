import axios from 'axios';
import { tasksConfig } from '../serviceConfig';

export function getTasks(accessToken) {
    const config = {
        headers: { Authorization: `Bearer ${accessToken}` }
    };
    console.log("API_REQ_GET_TASKS", config);
    return axios.get(`${tasksConfig.baseUrl}/tasks`, config);
}