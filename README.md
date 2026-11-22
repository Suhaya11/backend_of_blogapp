# backend_of_blogapp

this is the first full stack application that I've created
and this is the backend part of it.

its simple blog app with feature of user signup and login then user post,like,comment,dislike,report,adminLogin and report decision making by admin

the endpoints and the data needed are as follows

////////////////////////// ENDPOINTS /////////////////////////////// \***\*\*\*\*\***users endpoints******\*\*\*\*******\*******\*\*\*\*******

1.  SIGN UP

post to /api/users/adduser
this needs
/ unique username
/unique email
/random password of atlest 6 characters

2. LOGIN

post to /api/users/login
this needs
// correct username
//correct password

3. ADMIN LOGIN

post to /api/yanargizo/login

this needs

// admin username
// admin password
// admin secret
// admin auth

4.  EDIT USER DETAILS

patch to /api/users/edit/:id #where :id means id of the user
this needs
//correct username
// correct email
//correct password

5. USER LOGOUT
   post to /api/users/logout

6. GET ALL USER \*ADMIN

get /api/users/

7. GET SINGLE USER BY ID

get /api/users/:id where id is the id of desired user

8.  GET USER BY CREDENTIALS

    get /api/users/user
    this needs
    // username
    //password

9.  DELETE USER \*ADMIN
    delete to /api/users/user/:id where id is user to be deleted

******\*\*\*\*******post enpints********\*\*\*\*********
