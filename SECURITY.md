# Security Policy

## Sensitive Data Protection

This repository follows security best practices to protect sensitive information:

### What is Protected

1. **Environment Variables** (`.env` files)
   - Database credentials (MongoDB connection strings)
   - Admin passwords
   - API keys
   - All `.env` files are excluded via `.gitignore`

2. **User Data**
   - User passwords are hashed using bcrypt before storage
   - Password hashes are never exposed in API responses
   - User data stored securely in MongoDB (not in code)

3. **Admin Credentials**
   - Admin password stored in environment variable
   - Never hardcoded in source code

### Setup Requirements

When deploying this application, you **MUST**:

1. **Copy example environment files:**
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

2. **Update all placeholder values:**
   - Change `ADMIN_PASSWORD` to a strong, unique password
   - Update `MONGO_URL` with your actual MongoDB connection
   - Update `REACT_APP_BACKEND_URL` with your backend URL

3. **Never commit `.env` files:**
   - The `.gitignore` file is configured to exclude them
   - Always double-check before pushing to GitHub

### Security Checklist

Before making your repository public:

- [ ] All `.env` files are in `.gitignore`
- [ ] No hardcoded passwords in source code
- [ ] `.env.example` files contain only placeholders
- [ ] Admin password changed from default
- [ ] MongoDB credentials are environment variables
- [ ] Test that secrets are not visible in Git history

### Password Requirements

- **Admin Password**: Use a strong password (min 12 characters, mixed case, numbers, symbols)
- **User Passwords**: Minimum 6 characters (enforced by application)
- All passwords are hashed with bcrypt (cost factor: 12)

### Reporting Security Issues

If you discover a security vulnerability, please email the repository owner directly. Do not create a public issue.

### Best Practices for Contributors

1. Never commit real credentials
2. Use `.env.example` for documentation
3. Review changes before pushing
4. Keep dependencies updated
5. Use strong passwords

---

**Last Updated**: January 2025
