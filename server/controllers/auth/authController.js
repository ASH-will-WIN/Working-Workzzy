const { supabase, prisma } = require("../../db");
// Register a new user
const registerUser = async (req, res) => {
  const { email, password, name, role, phone } = req.body;

  // Validate required fields
  if (!phone) {
    return res.status(400).json({ error: "Phone number is required" });
  }

  // Basic phone number validation (at least 10 digits)
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ error: "Please enter a valid phone number" });
  }

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

    // Save phone number to user profile (now required)
    if (data.user) {
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
        // If we can't save the profile with phone number, we should fail the registration
        return res.status(500).json({ error: "Failed to create user profile" });
      }
    } else {
      console.log("User data missing:", {
        userId: data?.user?.id,
      });
      return res.status(500).json({ error: "Failed to create user" });
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
  // Determine client URL: Use env var, fallback to request origin, then default to localhost
  const origin = req.get('origin');
  const clientUrl = (process.env.CLIENT_URL || origin || "http://localhost:3000").replace(/\/$/, "");
  const redirectTo = `${clientUrl}/reset-password`;

  console.log("Forgot Password Request:", { email, clientUrl, redirectTo, headersOrigin: origin });

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
    // Create a temporary Supabase client authenticated as the user
    // This requires importing createClient from @supabase/supabase-js
    const { createClient } = require("@supabase/supabase-js");
    const tempSupabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      }
    );

    const { data, error } = await tempSupabase.auth.updateUser({
      password: password,
    });

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
