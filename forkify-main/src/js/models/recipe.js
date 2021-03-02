import axios from 'axios';


export default class Recipe {
    constructor(id) {
        this.id = id;
    }
    async getRecipe() {
        try {
            const res = await axios('http://www.json-generator.com/api/json/get/cgdxtEkgky?indent=2');
            const resItem = res.data[this.id];
            this.title = resItem.title;
            this.author = resItem.publisher;
            this.img = resItem.image_url;
            this.url = resItem.source_url;

            this.ingredients = [
                "4 1/2 cups (20.25 ounces) unbleached high-gluten, bread, or all-purpose floure, chilled",
                "1 1/2 cups (.44 ounce) teaspoons salt",
                "1 teaspoon (.11 ounce) instant yeast",
                "Semolina flour OR cornmeal for dusting",
                "2 Tbsp olive oil",
                "1 package (2 1.4 teaspoons) of active dry yeast (check the expiration data on the package)"
            ];
        } catch (error) {
            console.log(error);
            alert('something went wrong :(');
        }
    }


    calcTime() {
        // assuming that we need 15 min for each 3 ingredients
        const numIng = this.ingredients.length;
        const periods = Math.ceil(numIng / 3);
        this.time = periods * 15;
    }

    calcServing() {
        this.servings = 4;
    }

    parseIngredients() {
        const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
        const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];
        const units = [...unitsShort, 'kg', 'g'];


        const newIngredients = this.ingredients.map((el) => {

            // 1.Uniform units
            let ingredient = el.toLowerCase(); //for example, he may have used a large T in the tablespoons
            unitsLong.forEach((unit, i) => {
                ingredient = ingredient.replace(unit, unitsShort[i]);
            });

            // 2.Remove parentheses
            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');

            // 3.Parse ingredients into count, unit and ingredient
            const arrIng = ingredient.split(' ');
            const unitIndex = arrIng.findIndex(el2 => units.includes(el2));

            let objIng;
            if (unitIndex > -1) {
                // There is a unit
                // Ex. 4 1/2 cups, arrCount is [4, 1/2] --> eval("4+1/2") --> 4.5
                // Ex. 4 cups, arrCount is [4]
                const arrCount = arrIng.slice(0, unitIndex);
                let count;
                if (arrCount.length === 1) {
                    // count = arrIng[0];
                    count = eval(arrIng[0]);
                } else {
                    count = eval(arrIng.slice(0, unitIndex).join('+')).toFixed(1);
                }
                objIng = {
                    count,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex + 1).join(' ')
                };
            } else if (parseInt(arrIng[0], 10)) {
                // There is NO unit, but 1st element is number
                objIng = {
                    count: parseInt(arrIng[0], 10),
                    unit: '',
                    ingredient: arrIng.slice(1).join(' ')
                };
            } else if (unitIndex === -1) {
                // There is NO unit and NO number in 1st position
                objIng = {
                    count: 1,
                    unit: '',
                    ingredient
                };
            }
            return objIng;
        });
        this.ingredients = newIngredients;
    }

    updateServings(type) {
        // servings
        const newServing = type === 'dec' ? this.servings - 1 : this.servings + 1;

        // ingredients
        this.ingredients.forEach(ing => {
            ing.count *= (newServing / this.servings);
        });
        this.servings = newServing;
    }
}