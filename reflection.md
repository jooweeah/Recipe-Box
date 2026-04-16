1. What did you build and why? Which option did you pick? What made you choose it?

- I used my Midterm Project, Recipe Box, to add an Ai-powered feature where you can generate recipes just by writing a title and pressing a button. I used Ollama because it is a free LLM that runs locally and is simple to use. I wanted to add this feature because it tends to take a while to fully copy and write down a recipe from another source, so I wanted to make it easier by automatically generating and filing out the form. 


2. What surprised you? Was anything easier or harder than expected? Did the LLM/API behave differently than you anticipated?

- I was surprised that everything regarding Ollama's Ai feature could be put in the Recipe Form Javascript file, which I suppose makes sense because it runs entirely on one page and there is no API that needs protection since it runs locally. It was a lot easier to implement than I expected because of that. What bemused me was what happened when I put nonsense in the title of a recipe, it generated everything else in recipe format but overall the recipe didn't make sense. 

3. What did you learn about how these services work? If you used Ollama, what was it like running a model locally? If you used a cloud API, what was the experience of managing keys and handling errors?

- I learned that my application is only usable if Ollama is installed, so I created a new repository so it is separated from the app I had already built to avoid it from being deployed onto my website. I also learned that you must prompt the llm how to behave if you are using it for a certain feature, and not a general llm. For example, this was written in the code: "You are a recipe assistant. Given a recipe title, return a JSON object with these exact keys:..."

4. What would you do differently next time? If you had another week, what would you improve or try instead?
- Next time I would try to figure out another API feature to add, but one that does not run locally. Now I wish I could add the AI generate recipe feature to my website, however many cloud APIs cost money. I would likely try out Google AI Studio in the future.