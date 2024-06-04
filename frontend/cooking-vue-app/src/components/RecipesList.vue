<template>
    <div class="recipesList">
        <h1>{{ msg }}</h1>
        <ul>
          <li v-for="recipe in recipes" :key="recipe.id" >
            <span>{{ recipe.title }}</span>
          </li>
        </ul>
    </div>
  </template>

<script>
import axios from 'axios';

export default {
  name: 'RecipesList',
  props: {
    msg: String
  },
  data() {
    return {
      recipes: null
    }
  },
  methods: {
    async getRecipes() {
      await axios.get('api/data/recipes').then((response) => {
        this.recipes = response.data;
      });
    }
  },
  beforeMount() {
   this.getRecipes();
  }
}
</script>