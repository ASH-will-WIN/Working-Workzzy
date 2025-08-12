# Registration Process

The registration process is handled by the `Register.tsx` file, which includes user input fields for capturing essential user information, such as name, email, and password.

The `Register.tsx` file uses the `useState` hook to store the input values and the `useAuth` hook to handle the registration process.

The `AuthContext.tsx` file includes the `register` function, which handles the registration process by calling the `signUp` method of the Supabase client.

The `register` function takes three parameters: `email`, `password`, and `name`. The `name` field is stored in the Supabase database along with the user's email and password.

To register a new user, follow these steps:

1. Navigate to the registration page by clicking on the "Register" button.
2. Enter your name, email, and password in the input fields.
3. Click on the "Register" button to submit the registration form.
4. If the registration is successful, you will be redirected to the login page.

Note: The registration process is only visible to users who are not logged in. If you are already logged in, you will not see the registration form.