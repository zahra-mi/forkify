import axios from 'axios';
// import uniqid from 'uniqid';
import { elements } from '../views/base';

export default class Search {
    constructor(query) {
            this.query = query;
        }
        // The keyword function should not be used in the class
    async getResults() {
        try {
            const url = 'http://www.json-generator.com/api/json/get/cgdxtEkgky?indent=2'; // ?query & page=2
            const res = await axios(url);
            this.result = res.data;
            // this.myid = this.result.forEach(element => {
            //     element.uniqid();
            // });
        } catch (error) {
            alert(error);
        }
    }
}