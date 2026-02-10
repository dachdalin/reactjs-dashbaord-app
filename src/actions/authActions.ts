export type LoginState = {
    success: boolean;
    error?: string;
} | undefined;


// ── Login ──────────────────────────────────────────────
export const login = async (_prevState: LoginState, formData: FormData): Promise<LoginState> => {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Simulate an API call with a delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Fake login: accept any non-empty email & password
    if (email && password) {
        // Store a fake token to simulate auth
        localStorage.setItem("auth_token", "fake-jwt-token-123");
        localStorage.setItem("user", JSON.stringify({ email, name: email.split("@")[0] }));
        return { success: true };
    } else {
        return { success: false, error: "Please enter both email and password." };
    }
};

// ── Signup ──────────────────────────────────────────────

export type SignupState = {
    success: boolean;
    errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
    };
    message?: string;
} | undefined;

export const signup = async (_prevState: SignupState, formData: FormData): Promise<SignupState> => {
    const name = (formData.get("name") as string)?.trim();
    const email = (formData.get("email") as string)?.trim();
    const password = formData.get("password") as string;

    // Simulate an API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Basic validation
    const errors: NonNullable<SignupState>["errors"] = {};

    if (!name || name.length < 2) {
        errors.name = ["Name must be at least 2 characters."];
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = ["Please enter a valid email address."];
    }

    if (!password || password.length < 6) {
        errors.password = ["Be at least 6 characters long."];
    }

    if (Object.keys(errors).length > 0) {
        return { success: false, errors };
    }

    // Fake signup success – store auth
    localStorage.setItem("auth_token", "fake-jwt-token-123");
    localStorage.setItem("user", JSON.stringify({ email, name }));

    return { success: true, message: "Account created successfully!" };
};

// ── Logout ─────────────────────────────────────────────
export type LogoutState = {
    success: boolean;
} | undefined;

export const logout = async (): Promise<LogoutState> => {
    // Simulate an API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    return { success: true };
};