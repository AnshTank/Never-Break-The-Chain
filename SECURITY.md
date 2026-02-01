# Security Policy

## Security Overview

Never Break The Chain takes security seriously. This document outlines our security practices and how to report security vulnerabilities.

**Last Updated: January 2026**

## Security Measures

### Authentication & Authorization

- **JWT-based Authentication**: Secure token system with automatic refresh
- **Password Security**: bcrypt encryption with 12 rounds
- **Email Verification**: OTP-based account verification
- **Session Management**: Automatic token expiration and cleanup
- **Rate Limiting**: Protection against brute force attacks

### Data Protection

- **Encryption**: All sensitive data encrypted at rest and in transit
- **Input Validation**: Comprehensive validation using Zod schemas
- **NoSQL Injection Prevention**: Parameterized queries and input sanitization
- **XSS Protection**: Content Security Policy and output encoding
- **CSRF Protection**: SameSite cookies and token validation

### Infrastructure Security

- **HTTPS Only**: All communications encrypted with TLS
- **Secure Headers**: Security headers implemented via middleware
- **Environment Variables**: Sensitive configuration stored securely
- **Database Security**: MongoDB Atlas with IP whitelisting and authentication
- **Dependency Management**: Regular security updates and vulnerability scanning

## Reporting Security Vulnerabilities

If you discover a security vulnerability, please report it responsibly:

### What to Report

- Authentication bypasses
- Data exposure vulnerabilities
- Injection vulnerabilities (NoSQL, XSS, etc.)
- Privilege escalation issues
- Sensitive data leaks
- Any security-related bugs

### How to Report

1. **Primary Contact**: neverbreakthechain.anshtank@gmail.com
2. **Alternative Contact**: anshtank9@gmail.com
3. **Include**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Your contact information
4. **Response Time**: We aim to respond within 24-48 hours

### What NOT to Report

- Issues already covered in our documentation
- Social engineering attacks
- Physical security issues
- Denial of service attacks
- Issues requiring physical access to user devices

## Security Response Process

1. **Acknowledgment**: We'll confirm receipt within 24-48 hours
2. **Investigation**: Our team will investigate and validate the report
3. **Resolution**: We'll develop and test a fix
4. **Disclosure**: We'll coordinate disclosure with the reporter
5. **Recognition**: Valid reports may be eligible for recognition

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 1.0.x   | ✅ Yes    |
| < 1.0   | ❌ No     |

## Security Best Practices for Users

### Account Security

- Use a strong, unique password
- Keep your email account secure
- Log out from shared devices
- Report suspicious activity immediately

### Data Protection

- Don't share your account credentials
- Be cautious with public Wi-Fi
- Keep your browser updated
- Review your account activity regularly

## Security Features

### For Developers

- **Secure Development**: Following OWASP guidelines
- **Code Review**: All code changes reviewed for security
- **Dependency Scanning**: Regular vulnerability assessments
- **Security Testing**: Automated and manual security testing
- **Incident Response**: Documented procedures for security incidents

### For Users

- **Data Ownership**: You control your data
- **Privacy Controls**: Granular privacy settings
- **Data Export**: Export your data anytime
- **Account Deletion**: Complete data removal on request
- **Audit Logs**: Track account activity

## Contact Information

- **Security Reports**: neverbreakthechain.anshtank@gmail.com
- **General Support**: neverbreakthechain.anshtank@gmail.com
- **Project Maintainer**: anshtank9@gmail.com
- **GitHub Repository**: https://github.com/AnshTank/Never-Break-The-Chain

## Updates

This security policy is reviewed and updated regularly. Check back for the latest version.

---

**Remember**: Security is a shared responsibility. We're committed to protecting your data, and we appreciate your help in keeping Never Break The Chain secure for everyone.

© 2026 Never Break The Chain. All Rights Reserved.
