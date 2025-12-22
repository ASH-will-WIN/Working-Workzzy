const { supabase, prisma } = require("../../db");
// Register a new user
const registerUser = async (req, res) => {
  const { email, password, name, role, phone } = req.body;

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
      },
    });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Save phone number to user profile if provided
    if (phone && data.user) {
      console.log("Saving phone number to user profile:", {
        userId: data.user.id,
        phone,
      });
      try {
        await prisma.userProfile.create({
          data: {
            userId: data.user.id,
            phone: phone,
          },
        });
        console.log("Successfully saved user profile with phone number");
      } catch (profileError) {
        console.error("Error saving user profile:", profileError);
        // Don't fail the registration if profile creation fails
      }
    } else {
      console.log("Phone number not provided or user data missing:", {
        phone,
        userId: data?.user?.id,
      });
    }

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login a user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Send password reset email
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const redirectTo = `${process.env.CLIENT_URL || "http://localhost:3000"}/reset-password`;

  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ message: "Password reset email sent", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Reset password with token
const resetPassword = async (req, res) => {
  const { password, access_token } = req.body;

  try {
    // We can use the access_token directly to update the user's password
    const { data, error } = await supabase.auth.updateUser(
      { password },
      {
        accessToken: access_token,
      }
    );

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ message: "Password updated successfully", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
};
