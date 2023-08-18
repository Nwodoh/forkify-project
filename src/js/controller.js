import * as model from './model.js';
import recipeView from './views/recipeView.js';
// import './core-js/stable';
// import './regenerator-runtime/runtime';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import { MODAL_CLOSE_SEC } from './config.js';

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;

    recipeView.renderSpinner();

    // Updating active recipe
    // console.log(model.getSearchResultsPerPage());
    resultsView.update(model.getSearchResultsPerPage());
    bookmarksView.update(model.state.bookMark);

    // 1. Loading recipe
    await model.loadRecipe(id);

    // #2. Rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError(err);
  }
};

const controlSearchRecipe = async function () {
  try {
    const query = searchView.getQuery();
    if (!query) return;
    resultsView.renderSpinner();
    await model.loadSearchResults(query);
    resultsView.render(model.getSearchResultsPerPage());

    // checking and rendering pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    resultsView.renderError(err);
  }
};

console.log();
const controlPagination = function (gotoPage) {
  // 1. render NEW results
  resultsView.render(model.getSearchResultsPerPage(gotoPage));

  // 2. render NEW pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (numServings) {
  // Update the recipe servings (instate)
  model.updateServings(numServings);

  // Update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookMark = function () {
  // 1) Add / remove bookmark
  if (!model.state.recipe.bookmarked) {
    model.addBookMark(model.state.recipe);
  } else if (model.state.recipe.bookmarked)
    model.deleteBookMark(model.state.recipe.id);
  console.log(model.state.recipe);
  // 2) update recipe view
  recipeView.update(model.state.recipe);

  // 3) Render bookmarks
  bookmarksView.render(model.state.bookMark);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookMark);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // Render spinner
    addRecipeView.renderSpinner();

    await model.uploadRecipe(newRecipe);

    // Render added recipe
    recipeView.render(model.state.recipe);

    // Render success message
    addRecipeView.renderMessage();

    // Render bookmark view
    bookmarksView.render(model.state.bookMark);

    // Change hash to current recipe (Using the history API)
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // close addRecipe form
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
    console.log(model.state.recipe);
  } catch (err) {
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandler(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookMark(controlAddBookMark);
  searchView.addHandlerSearch(controlSearchRecipe);
  paginationView.addHandlerPagination(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
