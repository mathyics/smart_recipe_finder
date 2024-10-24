const MEALDB_API_URL = 'https://www.themealdb.com/api/json/v1/1/search.php?s=';

        const recipeGrid = document.getElementById('recipe-grid');
        const recipeModal = document.getElementById('recipe-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalImage = document.getElementById('modal-image');
        const modalInstructions = document.getElementById('modal-instructions');
        const modalIngredients = document.getElementById('modal-ingredients');
        const backdrop = document.getElementById('backdrop');

        // Fetch all recipes on page load
        async function fetchAllRecipes() {
            try {
                const response = await fetch(MEALDB_API_URL);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                const recipes = data.meals;
                displayRecipes(recipes); // Display all recipes
            } catch (error) {
                console.error("Error fetching recipes:", error);
                recipeGrid.innerHTML = `<p class="error-message">Error fetching recipes. Please try again later.</p>`;
            }
        }

        // Display recipes
        function displayRecipes(recipes) {
            if (!recipes) {
                recipeGrid.innerHTML = '<p>No recipes found.</p>';
                return;
            }
            recipeGrid.innerHTML = ''; // Clear existing recipes
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

        // Show recipe details in a modal
        async function showRecipeDetails(idMeal) {
            const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${idMeal}`);
            if (!response.ok) {
                console.error("Error fetching recipe details:", response.statusText);
                return;
            }
            const data = await response.json();
            const recipe = data.meals[0];

            modalTitle.textContent = recipe.strMeal;
            modalImage.src = recipe.strMealThumb;
            modalInstructions.textContent = recipe.strInstructions;
            modalIngredients.innerHTML = '';

            // Add ingredients and measurements
            for (let i = 1; i <= 20; i++) {
                const ingredient = recipe[`strIngredient${i}`];
                const measure = recipe[`strMeasure${i}`];
                if (ingredient) {
                    const listItem = document.createElement('li');
                    listItem.textContent = `${measure} ${ingredient}`;
                    modalIngredients.appendChild(listItem);
                }
            }

            recipeModal.classList.add('show');
            backdrop.classList.add('show');
        }

        function closeModal() {
            recipeModal.classList.remove('show');
            backdrop.classList.remove('show');
        }

        // Fetch all recipes on page load
        fetchAllRecipes();