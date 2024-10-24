const MEALDB_API_URL = 'https://www.themealdb.com/api/json/v1/1/filter.php?i=';
        const MEALDB_RECIPE_DETAILS_URL = 'https://www.themealdb.com/api/json/v1/1/lookup.php?i=';

        const ingredientInput = document.getElementById('ingredient-input');
        const ingredientsList = document.getElementById('ingredients-list');
        const recipeGrid = document.getElementById('recipe-grid');
        const recipeModal = document.getElementById('recipe-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalImage = document.getElementById('modal-image');
        const modalInstructions = document.getElementById('modal-instructions');
        const modalIngredients = document.getElementById('modal-ingredients');

        let ingredients = [];

        async function fetchRecipesForIngredient(ingredient) {
            const response = await fetch(`${MEALDB_API_URL}${encodeURIComponent(ingredient)}`);
            if (!response.ok) {
                console.error("Error fetching recipes:", response.statusText);
                return null;
            }
            const data = await response.json();
            return data.meals;
        }

        async function fetchRecipeDetails(recipeId) {
            const response = await fetch(`${MEALDB_RECIPE_DETAILS_URL}${recipeId}`);
            if (!response.ok) {
                console.error("Error fetching recipe details:", response.statusText);
                return null;
            }
            const data = await response.json();
            return data.meals[0]; // Access the first element since it's an array
        }

        async function fetchRecipesFromMealDB(ingredients) {
            let commonRecipes = [];
            for (const ingredient of ingredients) {
                const fetchedRecipes = await fetchRecipesForIngredient(ingredient);
                if (fetchedRecipes) {
                    if (commonRecipes.length === 0) {
                        commonRecipes = fetchedRecipes;
                    } else {
                        commonRecipes = commonRecipes.filter(recipe =>
                            fetchedRecipes.some(fetchedRecipe => fetchedRecipe.idMeal === recipe.idMeal)
                        );
                    }
                } else {
                    console.error("No recipes found for ingredient:", ingredient);
                }
            }
            return commonRecipes;
        }

        function addIngredient() {
            const value = ingredientInput.value.trim();
            if (value && !ingredients.includes(value)) {
                ingredients.push(value);
                updateIngredientsList();
                ingredientInput.value = '';
                updateRecipes();
            }
        }

        function removeIngredient(ingredient) {
            ingredients = ingredients.filter(item => item !== ingredient);
            updateIngredientsList();
            updateRecipes();
        }

        function updateIngredientsList() {
            ingredientsList.innerHTML = '';
            ingredients.forEach(ingredient => {
                const tag = document.createElement('div');
                tag.classList.add('ingredient-tag');
                tag.innerHTML = `
                    ${ingredient}
                    <button class="remove-btn" onclick="removeIngredient('${ingredient}')">×</button>
                `;
                ingredientsList.appendChild(tag);
            });
        }

        async function updateRecipes() {
            recipeGrid.innerHTML = ''; // Clear existing recipes
            if (ingredients.length === 0) return;
            const recipes = await fetchRecipesFromMealDB(ingredients);
            if (recipes) {
                recipes.forEach(recipe => {
                    const card = document.createElement('div');
                    card.classList.add('recipe-card');
                    card.innerHTML = `
                        <img class="recipe-image" src="${recipe.strMealThumb}" alt="${recipe.strMeal}" />
                        <div class="recipe-content">
                            <h3 class="recipe-title">${recipe.strMeal}</h3>
                            <div class="recipe-meta">
                                <span>ID: ${recipe.idMeal}</span>
                            </div>
                        </div>
                    `;
                    card.addEventListener('click', () => showRecipeDetails(recipe.idMeal));
                    recipeGrid.appendChild(card);
                });
            }
        }

        async function showRecipeDetails(recipeId) {
            const recipe = await fetchRecipeDetails(recipeId);
            if (recipe) {
                modalTitle.textContent = recipe.strMeal;
                modalImage.src = recipe.strMealThumb;
                modalInstructions.textContent = recipe.strInstructions;

                modalIngredients.innerHTML = '';
                for (let i = 1; i <= 20; i++) {
                    const ingredient = recipe[`strIngredient${i}`];
                    const measure = recipe[`strMeasure${i}`];
                    if (ingredient) {
                        const item = document.createElement('p');
                        item.textContent = `${ingredient} - ${measure}`;
                        modalIngredients.appendChild(item);
                    }
                }

                openModal();
            }
        }

        function openModal() {
            recipeModal.classList.add('show');
        }

        function closeModal() {
            recipeModal.classList.remove('show');
        }