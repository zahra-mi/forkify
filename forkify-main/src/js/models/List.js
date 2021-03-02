import uniqid from 'uniqid';



export default class List {
    constructor() {
        this.items = [];
    }

    addItem(count, unit, ingredient) {
        const item = {
            id: uniqid(),
            count, // count:count
            unit,
            ingredient
        }
        this.items.push(item);
        return item;
    }

    deleteItem(id) {
        const index = this.items.findIndex(el => el.id === id);
        //[2, 4, 6] splice(1, 2)  --> return [4 , 6], orginal array is [2]  -->remove  4, 6 from array
        //[2, 4, 6] slice(1, 2)  --> return 4, orginal array is [2, 4, 6]
        this.items.splice(index, 1);
    }

    updateCount(id, newCount) {
        this.items.find(el => el.id === id).count = newCount;
    }

}