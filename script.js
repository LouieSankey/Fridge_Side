'use strict';

const apiKey = ""
let allRecipesJson;
let shoppingList = [];


function watchSearchForm() {
    $('#js-form').submit(event => {
        event.preventDefault();
        $(`#recipe-display`).html("")
        const ingredients = $('#js-form').find('input[name="recipe-search"]').val()
        const priority = $("#js-priority").val();
        const pantry = $('#js-pantry').is(':checked')
        getRecipes(ingredients, priority, pantry);
    });
}



function getRecipes(ingredients, priority, pantry) {

    fetch(`https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients}&number=9&ranking=${priority}&ignorePantry=${pantry}&apiKey=${apiKey}`)
        .then(response => response.json())
        .then(responseJson =>
            displayRecipeSelection(responseJson))
        .catch(error => alert('Something went wrong. Try again later.'));
}



function displayRecipeSelection(responseJson) {
    allRecipesJson = responseJson;

    $('#main-display').removeClass("hidden");
    $("#recipe-display").html("")


    allRecipesJson.forEach((obj, i) => {

        const priority = $("#js-priority").val();
        if (priority == 1) {
            $("#recipe-display").append(
                $(`
        <li class="recipe-item" id="${i}"><a href="#" >
     
            <div class="image-caption">
            <h3 class="caption-text">Missing Ingredients: ${obj.missedIngredientCount} </h3>
            <h2 class="caption-text">${obj.title}</h2>
            </div>

            <img class="recipe-image" src="${obj.image}" alt="An image of ${obj.title}">

      
        </a></li>`))
        } else {
            $("#recipe-display").append(
                $(`
        <li class="recipe-item" id="${i}"><a href="#">
        <div class="image-caption">
        <h3 class="caption-text">Your Ingredients Used: ${obj.usedIngredientCount} </h3>
        <h2 class="caption-text">${obj.title}</h2>
   
        
        </div>
        <img class="recipe-image" src="${obj.image}" alt="An image of ${obj.title}">
        </a></li>`))
        }
    })
    $('#recipe-display').find('#0').click()
    $('#recipe-display').find('#0').addClass("selected")
}



function onSelectRecipe() {

    $('#recipe-display').on('click', '.recipe-item', function (elem) {
        elem.preventDefault();
        const recipeIndex = $(this).attr('id')
        const selectedRecipeId = allRecipesJson[recipeIndex].id
        const selectedRecipe = allRecipesJson[recipeIndex]

        $(".selected").removeClass("selected")
        $('#recipe-display').find(`#${recipeIndex}`).addClass("selected")

        fetch(`https://api.spoonacular.com/recipes/${selectedRecipeId}/analyzedInstructions?apiKey=${apiKey}`)
            .then(recipeResponse => recipeResponse.json())
            .then(recipeResponse => listRecipeSteps(recipeResponse, selectedRecipe))
            .catch(err => listRecipeSteps(undefined, selectedRecipe))

    });

}



function scrollRight() {
    $("#scroll-right").on("click", function (event) {
        $('#recipe-display').animate({
            scrollLeft: "+=500px"
        }, 50);


    })

}

function scrollLeft() {
    $("#scroll-left").on("click", function (event) {
        $('#recipe-display').animate({
            scrollLeft: "-=500px"
        }, 50);

    })

}




function listRecipeSteps(recipeResponse, selectedRecipe) {

    const unusedCount = selectedRecipe.unusedIngredients.length
    const missingIngredients = []

    $(`#recipe-name`).text(selectedRecipe.title)
    $(`#missing-ingredients`).text("")
    $(`#unused-ingredients`).text("")
    $(`#recipe-instructions`).html("")

    if (recipeResponse === undefined) {
        $(`#recipe-instructions`).html("Sorry, we don't have a recipe for this, but the above photograph may help!")
    } else {
        recipeResponse[0].steps.forEach(steps => {
            $(`#recipe-instructions`).append(
                $(`<li>${steps.step}</li><br>`))
        })
    }

    if (unusedCount === 0) {
        $(`#unused-ingredients`).text("None")
    }
    if (selectedRecipe.missedIngredientCount.length === 0) {
        $(`#missing-ingredients`).text("None")
    }

    selectedRecipe.unusedIngredients.forEach(ingredient => {
        $(`#unused-ingredients`).append(
            $(`<li>${ingredient.name}</li>`))
    })

    selectedRecipe.missedIngredients.forEach((ingredient, i) => {

        const recipeIndex = $(this).attr('id')
        missingIngredients.push(ingredient.name);

        if ($(`#smissing-ingredients:contains(${ingredient.name})`).length < 1) {
            $(`#missing-ingredients`).append(
                $(`<li><p><button id="missing-ingredient-${i}" class="select-ingredient-button">+</button><span>  ${ingredient.name}</span></p></li>`))
        }

    })
}


function addToShoppingList() {
    $('#missing-ingredients').on('click', '.select-ingredient-button', function (elem) {
        elem.preventDefault();

        const recipeIndex = $(this).attr('id')
        const selectedIgredient = $(`#missing-ingredients`).find(`#${recipeIndex}`).siblings('span').text()

        if ($(`#shopping-list:contains(${selectedIgredient})`).length < 1) {
            $(`#shopping-list`).append(`<li><p><button class="shopping-list-item-button">-</button>  <span>${selectedIgredient}</span></p></li>`)
            shoppingList.push(selectedIgredient)
        }
    })
}

function sendWithTwillio() {

    
    $('#send-list').on('click', '.bottom-form-button', function (elem) {
        elem.preventDefault();



        let list = shoppingList.map(item => {
            return item.trim() + '\n'
        })

        list = list.toString().replaceAll(',', '')
        const phone = '+1' + $('.bottom-form-input').val().replace('-', '')
      
        fetch('https://whispering-sierra-15762.herokuapp.com/', {
        method: 'post',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({phone: phone, shopping_list: list})
        })
        .then(res=>res.json())
        

        $('.bottom-form-button').text("LIST SENT!")

        setTimeout(() => {
            $('.bottom-form-button').text("SEND")
        }, 3000);


      
 

    })
}


function removeFromShoppingList() {
    $('#shopping-list').on('click', '.shopping-list-item-button', function (elem) {
        elem.preventDefault();
        const removedIngredient = $(this).siblings('span').text()
        const index = shoppingList.indexOf(removedIngredient);
        if (index > -1) {
            shoppingList.splice(index, 1);
        }
        $(this).closest('li').remove()

    })
}


$(function () {
    scrollRight()
    scrollLeft()
    removeFromShoppingList()
    addToShoppingList()
    watchSearchForm();
    onSelectRecipe()
    sendWithTwillio()
});
