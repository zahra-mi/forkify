    // Global app controller
    import Search from './models/Search';
    import * as searchView from './views/searchView';
    import * as recipeView from './views/recipeView';
    import * as listView from './views/listView';
    import * as likesView from './views/likesView';
    import Recipe from './models/recipe';
    import List from './models/List';
    import Likes from './models/likes';
    import { elements, renderLoader, clearLoader } from './views/base';


    const state = {};

    /**
     * SEARCH CONTROLLER
     */
    const controlSearch = async() => {
        // 1)Get query from view
        const query = searchView.getInput();

        if (query) {
            // 2) new search objet and add to state 
            state.search = new Search(query);

            // 3) prepre UI for results 
            searchView.clearInput();
            searchView.clearResults();
            renderLoader(elements.searchRes);
            try {
                // 4) search for recipes
                await state.search.getResults();

                // 5) render results on ui
                clearLoader();
                searchView.renderResults(state.search.result);
            } catch (error) {
                alert('somthing wrong with the search...');
                clearLoader();
            }
        }
    };


    elements.searchForm.addEventListener('submit', e => {
        e.preventDefault();
        controlSearch();
    });


    elements.searchResPages.addEventListener('click', e => {
        const btn = e.target.closest('.btn-inline');
        if (btn) {
            const goToPage = parseInt(btn.dataset.goto, 10); //convert to the number
            searchView.clearResults();
            searchView.renderResults(state.search.result, goToPage);
        }
    });


    document.querySelector('body').addEventListener('keypress', e => {
        if (event.keyCode === 115 || event.which === 115) {
            elements.searchInput.focus();
        }
    })



    /**
     * RECIPE CONTROLLER
     */
    const controllRecipe = async() => {
        // Get ID from url
        const id = window.location.hash.replace('#', ''); // delet # in hash for id

        if (id) {
            // Prepare UI for changes
            recipeView.clearRecipe();
            renderLoader(elements.recipe);

            // Highlight selected search item
            if (state.search) searchView.highLightSelected(id);

            // Create new recipe object
            state.recipe = new Recipe(id);

            try {
                // Get recipe data and parse ingredients
                await state.recipe.getRecipe();
                state.recipe.parseIngredients();

                // Calculate servings and time
                state.recipe.calcTime();
                state.recipe.calcServing();

                // Render recipe
                clearLoader();
                recipeView.renderRecipe(
                    state.recipe,
                    state.likes.isLiked(id)
                );

            } catch (error) {
                console.log(error)

                console.log('Error prossesing recipe!');
            }
        }
    };



    /*
    window.addEventListener('hashchange', controllRecipe);
    window.addEventListener('load', controllRecipe);
    */
    ['hashchange', 'load'].forEach(event => window.addEventListener(event, controllRecipe));




    /**
     * LIST CONTROLlER
     */
    const controlList = () => {
        // Create a new list if there in none yet
        if (!state.List) state.List = new List();

        // Add each ingredient to the list
        state.recipe.ingredients.forEach(el => {
            const item = state.List.addItem(el.count, el.unit, el.ingredient);
            listView.renderItem(item);
        });
    };



    // Handling delete and update list item event
    elements.shopping.addEventListener('click', e => {
        const id = e.target.closest('.shopping__item').dataset.itemid;

        // Handling the delete botton
        if (e.target.matches('.shopping__delete, .shopping__delete *')) {
            // delete from state
            state.List.deleteItem(id);
            // delete from UI
            listView.deleteItem(id);
        } else if (e.target.matches('.shopping__count-value, .shopping__count-value *')) {
            const value = parseFloat(e.target.value, 10);
            state.List.updateCount(id, value);
        }
    });




    /**
     * LIKE CONTROLLER
     */
    const controlLike = () => {
        if (!state.likes) state.likes = new Likes();
        const currentID = window.location.hash.replace('#', '');;

        // use not yet like current recipe
        if (!state.likes.isLiked(currentID)) {
            // Add like to the state
            const newLike = state.likes.addLike(
                currentID,
                state.recipe.title,
                state.recipe.author,
                state.recipe.img
            );

            // Toggle the like botton
            likesView.toggleLikeBtn(true);

            // Add like to the UI
            likesView.renderLike(newLike);

        } // user has liked current recipe
        else {
            // remove like from the state
            state.likes.deleteLike(currentID);

            // Toggle the like botton
            likesView.toggleLikeBtn(false);

            // remove like from the UI
            likesView.deleteLike(currentID);
        }
        likesView.toggleLikeMenu(state.likes.getNumLikes());
    };


    // Restore liked recipes on page load
    window.addEventListener('load', () => {
        state.likes = new Likes();

        // Restore likes
        state.likes.readStorage();

        // toggle like menu button
        likesView.toggleLikeMenu(state.likes.getNumLikes());

        // render the existing likes
        state.likes.likes.forEach(like => likesView.renderLike(like));
    });



    // Handling recipe botton clicks
    elements.recipe.addEventListener('click', e => {
        if (e.target.matches('.btn-decrease ,.btn-decrease * ')) {
            // decrease botton is click
            if (state.recipe.servings > 1) {
                state.recipe.updateServings('dec');
                recipeView.updateServingsIngredients(state.recipe);
            }
        } else if (e.target.matches('.btn-increase ,.btn-increase * ')) {
            // increase botton is click
            state.recipe.updateServings('inc');
            recipeView.updateServingsIngredients(state.recipe);
        } else if (e.target.matches('.recipe__btn--add , .recipe__btn--add *')) {
            //  Add ingredients to the shopping list
            controlList();
        } else if (e.target.matches('.recipe__love , .recipe__love *')) {
            //Like controller
            controlLike();
        }
    });