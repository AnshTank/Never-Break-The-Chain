# Security Policy

## 🛡️ Security Overview

Never Break The Chain implements enterprise-grade security measures to protect user data and ensure application integrity. This document outlines our comprehensive security practices, vulnerability reporting process, and compliance measures.

## 🔐 Security Architecture

### Multi-Layer Security Approach
- **Application Layer**: Input validation, authentication, authorization
- **Transport Layer**: TLS 1.3 encryption, secure headers
- **Data Layer**: Encryption at rest, secure database connections
- **Infrastructure Layer**: Network isolation, monitoring, logging

## 🔒 Core Security Features

### Authentication & Authorization
- **🔑 JWT Token Security**: 
  - Secure token generation with 256-bit secrets
  - Automatic token rotation every 24 hours
  - Dual expiration modes: 1 hour (normal), 180 days (remember me)
  - Token blacklisting for immediate revocation
  - HttpOnly cookies with SameSite=Strict

- **🔐 Password Security**: 
  - bcrypt hashing with 12 rounds (industry standard)
  - Password strength requirements (8+ chars, mixed case, numbers, symbols)
  - Protection against rainbow table attacks
  - Secure password reset with time-limited tokens
  - No plaintext password storage

- **📧 OTP Verification**: 
  - 6-digit time-based one-time passwords
  - 5-minute expiration window
  - Rate limiting (max 3 attempts per 15 minutes)
  - Secure email delivery with HTML templates
  - In-memory storage with automatic cleanup

- **📱 Device Management**: 
  - Multi-device authentication tracking
  - Session fingerprinting and validation
  - Automatic logout on suspicious activity
  - Device registration with unique identifiers
  - Trusted device management

### Data Protection & Privacy

- **✅ Input Validation & Sanitization**: 
  - Comprehensive Zod schema validation
  - **XSS Protection** (Added Jan 2025):
    - HTML tag removal: `/<[^>]*>/g`
    - Script content stripping: `/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi`
    - JavaScript protocol blocking: `/javascript:/gi`
    - Event handler removal: `/on\w+\s*=/gi`
  - SQL/NoSQL injection prevention
  - CSRF protection with SameSite cookies
  - Applied to: user names, MNZD configs, contact forms, feedback

- **🛡️ Rate Limiting**: 
  - Progressive blocking system (1-5-15 minute escalation)
  - IP-based tracking with in-memory caching
  - API endpoint specific limits:
    - `/api/auth/login`: 5 requests/15 min
    - `/api/auth/signup`: 3 requests/hour
    - `/api/progress`: 60 requests/min
    - `/api/analytics`: 30 requests/min
  - DDoS protection with exponential backoff
  - Cron endpoint protection with secret token

- **🌐 Security Headers**: 
  - Content Security Policy (CSP)
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - Referrer-Policy: strict-origin-when-cross-origin
  - Permissions-Policy for feature control
  - Strict-Transport-Security (HSTS)

- **📝 Audit Logging**: 
  - Comprehensive security event tracking
  - Failed login attempt monitoring
  - Suspicious activity detection
  - Real-time alerting for critical events
  - Device registration logging

### Infrastructure Security

- **🔐 Database Security**: 
  - MongoDB Atlas with network isolation
  - Connection string encryption
  - Database-level access controls
  - Regular security patches and updates

- **🌐 Network Security**: 
  - HTTPS enforcement (TLS 1.3)
  - Secure cookie attributes (HttpOnly, Secure, SameSite)
  - CORS policy configuration
  - API gateway protection

- **🔑 Environment Security**: 
  - Secure environment variable management
  - Secrets rotation policies
  - Production/development environment isolation
  - Secure deployment pipelines

## 🚨 Recent Security Updates (January 2025)

### XSS Protection Enhancement
**Status**: ✅ Implemented and Deployed

**Changes**:
1. **Input Sanitization** (`lib/validation.ts`):
   - Added `sanitizeString()` function
   - Removes HTML tags, script content, javascript: protocols
   - Strips event handlers (onclick, onerror, etc.)
   - Applied to all user-facing inputs

2. **Date Parameter Validation** (`app/api/analytics/route.ts`):
   - Regex validation for YYYY-MM-DD format
   - Date range validation (prevents future dates beyond 1 year)
   - Protection against injection attacks

3. **Affected Endpoints**:
   - `/api/auth/signup` - Name sanitization
   - `/api/settings` - MNZD config sanitization
   - `/api/contact` - Message sanitization
   - `/api/feedback` - Feedback sanitization
   - `/api/progress` - Progress updates sanitization
   - `/api/analytics` - Month parameter validation

**Impact**: Prevents script injection, XSS attacks, and malicious HTML execution

### Timezone & Caching Fixes
**Status**: ✅ Resolved

**Issues Fixed**:
1. **UTC/IST Timezone Conversion**: Fixed month offset bug in analytics
2. **Vercel Caching**: Added `force-dynamic` and cache-control headers
3. **Weekly Email Timing**: Corrected from Sunday to Monday
4. **Task Completion Format**: Changed from days to tasks (x/28)

## 📊 Supported Versions

| Version | Supported | Security Updates | End of Life |
|---------|-----------|------------------|-------------|
| 1.3.x   | ✅ Yes    | Active          | TBD         |
| 1.2.x   | ✅ Yes    | Security Only   | 2025-06-01  |
| 1.1.x   | ⚠️ Limited| Critical Only   | 2025-03-01  |
| < 1.1   | ❌ No     | None            | 2025-01-15  |

## 🚨 Vulnerability Reporting

We take security vulnerabilities seriously and appreciate responsible disclosure from the security community.

### 📧 Contact Information
- **Primary Contact**: [anshtank9@gmail.com](mailto:anshtank9@gmail.com)
- **Subject Line**: `[SECURITY] Never Break The Chain - Vulnerability Report`
- **PGP Key**: Available on request for sensitive reports
- **Response SLA**: Within 24 hours (business days)

### 📋 Report Requirements

Please include the following information in your report:

1. **Vulnerability Details**:
   - Clear description of the security issue
   - Affected components/endpoints
   - Potential impact assessment
   - CVSS score (if applicable)

2. **Reproduction Steps**:
   - Detailed step-by-step instructions
   - Required tools or environment setup
   - Expected vs actual behavior
   - Screenshots or video proof (if applicable)

3. **Technical Information**:
   - Browser/client information
   - Network configuration details
   - Payload examples (sanitized)
   - Proof of concept code

4. **Suggested Remediation**:
   - Recommended fixes or mitigations
   - Alternative solutions
   - Timeline considerations
   - Impact on existing functionality

### 🔄 Response Process

1. **Acknowledgment** (24 hours):
   - Confirm receipt of vulnerability report
   - Assign unique tracking ID
   - Initial impact assessment

2. **Investigation** (1-7 days):
   - Technical team validates the issue
   - Reproduce the vulnerability
   - Assess severity and impact
   - Determine affected versions

3. **Resolution** (varies by severity):
   - **Critical**: 24-48 hours
   - **High**: 3-7 days
   - **Medium**: 2-4 weeks
   - **Low**: Next scheduled release

4. **Disclosure** (coordinated):
   - Agree on disclosure timeline
   - Prepare security advisory
   - Release patches and updates
   - Public disclosure (if applicable)

5. **Recognition**:
   - Security researcher credit (if desired)
   - Hall of fame listing
   - Potential bug bounty (case by case)

## 🛠️ Security Best Practices

### For Users
- **🔐 Account Security**:
  - Use strong, unique passwords (12+ characters)
  - Enable two-factor authentication when available
  - Regularly review account activity
  - Log out from shared/public devices

- **🌐 Browser Security**:
  - Keep browsers updated to latest versions
  - Use reputable browser extensions only
  - Clear cookies/cache regularly
  - Avoid public Wi-Fi for sensitive operations

- **📱 Device Security**:
  - Keep devices updated with security patches
  - Use device lock screens/biometrics
  - Install apps from official stores only
  - Report suspicious activity immediately

### For Developers
- **💻 Development Security**:
  - Follow secure coding practices (OWASP guidelines)
  - Validate all user inputs server-side
  - Use parameterized queries/prepared statements
  - Implement proper error handling (no sensitive info leakage)

- **🔍 Code Review Process**:
  - Security-focused peer reviews
  - Automated security scanning (SAST/DAST)
  - Dependency vulnerability scanning
  - Regular security architecture reviews

- **🚀 Deployment Security**:
  - Secure CI/CD pipelines
  - Environment variable protection
  - Container security scanning
  - Infrastructure as Code (IaC) security

## 📅 Security Update Schedule

### Regular Updates
- **Security Patches**: Released as needed (critical issues)
- **Minor Updates**: Monthly (includes security improvements)
- **Major Updates**: Quarterly (comprehensive security reviews)
- **Dependency Updates**: Weekly automated scanning

### Emergency Response
- **Critical Vulnerabilities**: 0-day patches within 24 hours
- **High Severity**: Patches within 72 hours
- **Public Exploits**: Immediate response and mitigation
- **Zero-Day Attacks**: Emergency response team activation

## 📜 Compliance & Standards

### Privacy Regulations
- **🇪🇺 GDPR Compliance**:
  - Data minimization principles
  - User consent management
  - Right to be forgotten implementation
  - Data portability features
  - Privacy by design architecture

- **🇺🇸 CCPA Compliance**:
  - Consumer rights implementation
  - Data disclosure transparency
  - Opt-out mechanisms
  - Third-party data sharing controls

### Security Standards
- **🔒 OWASP Top 10**: 
  - Protection against all top 10 vulnerabilities
  - Regular assessment and testing
  - Continuous monitoring and improvement
  - Developer training and awareness

- **🛡️ Security Frameworks**:
  - NIST Cybersecurity Framework alignment
  - ISO 27001 principles implementation
  - SOC 2 Type II considerations
  - Regular third-party security assessments

## 🔍 Security Testing & Monitoring

### Automated Security Testing
- **🤖 Static Analysis (SAST)**:
  - ESLint security rules
  - SonarQube security scanning
  - CodeQL analysis
  - Custom security linting rules

- **🌐 Dynamic Analysis (DAST)**:
  - OWASP ZAP integration
  - Automated penetration testing
  - API security testing
  - Runtime security monitoring

- **📦 Dependency Scanning**:
  - npm audit integration
  - Snyk vulnerability scanning
  - GitHub Dependabot alerts
  - License compliance checking

### Manual Security Reviews
- **👥 Code Reviews**: 
  - Security-focused peer reviews
  - Architecture security assessments
  - Threat modeling exercises
  - Security design pattern validation

- **🔍 Penetration Testing**: 
  - Quarterly external assessments
  - Annual comprehensive audits
  - Red team exercises
  - Bug bounty program participation

- **📊 Security Metrics**:
  - Vulnerability response times
  - Security test coverage
  - Incident response effectiveness
  - User security awareness levels

## 🚨 Incident Response Plan

### Response Team
- **🎯 Security Lead**: Ansh Tank (anshtank9@gmail.com)
- **💻 Technical Lead**: Development team
- **📞 Communications**: Customer support team
- **⚖️ Legal/Compliance**: External counsel (as needed)

### Response Phases
1. **🔍 Detection & Analysis**:
   - Automated monitoring alerts
   - User-reported incidents
   - Third-party notifications
   - Security researcher reports

2. **🛡️ Containment & Eradication**:
   - Immediate threat isolation
   - System hardening measures
   - Malicious code removal
   - Vulnerability patching

3. **🔄 Recovery & Lessons Learned**:
   - System restoration procedures
   - Monitoring enhancement
   - Process improvements
   - Team training updates

## 📊 Security Metrics & KPIs

### Key Performance Indicators
- **⏱️ Mean Time to Detection (MTTD)**: < 15 minutes
- **🚀 Mean Time to Response (MTTR)**: < 2 hours
- **🔧 Mean Time to Recovery (MTTR)**: < 4 hours
- **📈 Security Test Coverage**: > 90%

### Monitoring Dashboards
- **🔍 Real-time Security Events**: 24/7 monitoring
- **📊 Vulnerability Trends**: Weekly reports
- **🎯 Compliance Status**: Monthly assessments
- **👥 User Security Behavior**: Quarterly analysis

## 🔗 Security Resources & References

### Documentation
- [OWASP Security Guidelines](https://owasp.org/)
- [Next.js Security Best Practices](https://nextjs.org/docs/advanced-features/security-headers)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/security/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

### Tools & Libraries
- **🔐 Authentication**: JWT, bcrypt, OTP generators
- **✅ Validation**: Zod schemas, input sanitization
- **🛡️ Security**: Helmet.js, CORS, rate limiting
- **📊 Monitoring**: Custom audit logging, error tracking

### Training & Awareness
- **👨‍💻 Developer Training**: Monthly security workshops
- **📚 Security Resources**: Curated learning materials
- **🎯 Awareness Programs**: Quarterly security updates
- **🏆 Recognition**: Security champion program

## 📞 Emergency Contacts

### Critical Security Issues
- **📧 Primary**: [anshtank9@gmail.com](mailto:anshtank9@gmail.com)
- **📱 Emergency**: Available on request for verified researchers
- **⏰ Response Time**: 24/7 monitoring for critical issues
- **🌍 Timezone**: UTC+5:30 (IST) - India Standard Time

### Business Hours Support
- **🕘 Hours**: Monday-Friday, 9 AM - 6 PM IST
- **📞 Response**: Within 4 hours during business hours
- **📧 Non-Critical**: Standard email support
- **💬 Community**: GitHub Discussions for general questions

---

## 📜 Legal & Compliance Notice

This security policy is subject to change without notice. Users, developers, and security researchers are encouraged to review this document regularly for updates.

**Responsible Disclosure**: We request that security researchers follow responsible disclosure practices and allow reasonable time for issue resolution before public disclosure.

**Legal Protection**: We will not pursue legal action against security researchers who:
- Act in good faith
- Follow responsible disclosure practices
- Do not access/modify user data
- Do not disrupt service availability

**Last Updated**: January 2025  
**Version**: 2.1.0  
**Next Review**: April 2025

**Recent Changes**:
- Added XSS protection with input sanitization
- Enhanced date parameter validation
- Updated security version table
- Documented timezone and caching fixes

---

<div align="center">

**🛡️ Security is Our Priority**

*Built with security-first principles by [Ansh Tank](https://anshtank.me)*

**Report Security Issues**: [anshtank9@gmail.com](mailto:anshtank9@gmail.com)

</div>