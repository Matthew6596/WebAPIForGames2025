# Project Set-up
You can set-up and run this project by:
1. Cloning this repository
2. Opening the folder with Visual Studio Code
3. Running ```npm install``` in the vs terminal
4. Running ```node app``` or ```npx nodemon``` in the terminal to start the server
5. Additionally, you might need a MongoDB collection "userdata" and "fooddata" in database "crudapp" underneath localhost:27017

# Authentication
The authentication uses bcryptjs.  
If the user tries to add or edit the list while not logged in, they will be redirected to the login.  
There is also an app.get for user authentication, so the index page can fetch whether the user is logged in and display different content (such as edit button or logout button).
