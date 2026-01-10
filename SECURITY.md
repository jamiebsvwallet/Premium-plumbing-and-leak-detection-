# Security Updates

## Patched Vulnerabilities (January 2026)

### Critical Fixes ✅

1. **Next.js Updated: 14.0.4 → 14.2.35**
   - Fixed: Denial of Service with Server Components
   - Fixed: Authorization bypass vulnerability
   - Fixed: Cache Poisoning vulnerability
   - Fixed: Server-Side Request Forgery in Server Actions
   - Fixed: Authorization Bypass in Middleware
   - All 28 reported Next.js vulnerabilities patched

2. **Nodemailer Updated: 6.9.7 → 7.0.7**
   - Fixed: Email to unintended domain due to Interpretation Conflict
   - Fixed: Domain validation issues

### Remaining Known Issues ⚠️

The following vulnerabilities remain in **transitive dependencies** (dependencies of dependencies):

1. **bsv library → pbkdf2**
   - Severity: Critical
   - Issue: pbkdf2 silently disregards Uint8Array input
   - Status: Waiting for bsv library update
   - Mitigation: BSV integration is optional and stubbed by default

2. **html-pdf → phantomjs-prebuilt**
   - Severity: Moderate
   - Issue: Deprecated phantomjs package
   - Status: html-pdf is deprecated
   - Mitigation: PDF generation is optional; consider migrating to puppeteer

3. **puppeteer → tar-fs**
   - Severity: High
   - Issue: Transitive dependency vulnerability
   - Status: Waiting for puppeteer update
   - Mitigation: Puppeteer is used for optional PDF generation only

4. **form-data → unsafe random boundary**
   - Severity: Critical (in older versions)
   - Status: Used by nodemailer (now updated to 7.0.7)
   - Mitigation: Nodemailer 7.0.7 uses updated form-data

5. **glob (in dev dependencies)**
   - Severity: High
   - Issue: CLI command injection
   - Status: Dev dependency only, not in production
   - Mitigation: Not exposed in production builds

## Recommendations

### For Production Use

1. **Immediate Actions ✅**
   - ✅ Updated Next.js to 14.2.35 (all critical vulnerabilities patched)
   - ✅ Updated nodemailer to 7.0.7

2. **Consider Replacing** (Optional)
   - Replace `html-pdf` with `puppeteer` or `@react-pdf/renderer` for PDF generation
   - Consider alternative BSV libraries if available
   - Keep puppeteer updated when new versions are released

3. **Environment Configuration**
   - Set `PUPPETEER_SKIP_DOWNLOAD=true` if not using PDF generation
   - Don't configure `BSV_PRIVATE_KEY` unless blockchain features are needed
   - Keep all dependencies updated: `npm update`

### Security Best Practices

1. **Regular Updates**
   ```bash
   npm audit
   npm audit fix
   npm update
   ```

2. **Monitor Dependencies**
   - Use GitHub Dependabot alerts
   - Review `npm audit` output regularly
   - Update dependencies monthly

3. **Production Hardening**
   - Use environment variables for secrets
   - Enable HTTPS only
   - Implement rate limiting
   - Use security headers
   - Keep NODE_ENV=production

## Vulnerability Impact Assessment

### Critical (Patched) ✅
- **Next.js DoS**: Could cause server crashes → **FIXED in 14.2.35**
- **Next.js Auth Bypass**: Could allow unauthorized access → **FIXED in 14.2.35**
- **Nodemailer Domain Issue**: Could send emails to wrong domain → **FIXED in 7.0.7**

### Remaining (Transitive)
- **bsv/pbkdf2**: Only affects BSV key generation (optional feature, disabled by default)
- **html-pdf/phantomjs**: Only affects PDF generation (optional feature)
- **puppeteer/tar-fs**: Only affects PDF generation (optional feature)
- **glob**: Dev dependency only, not in production bundle

## Deployment Notes

When deploying, ensure:
1. ✅ Use Next.js 14.2.35 or higher
2. ✅ Use nodemailer 7.0.7 or higher
3. Set `NODE_ENV=production`
4. Don't install dev dependencies in production: `npm ci --production`
5. Monitor security advisories for updates

## Version History

- **v0.1.0** (Initial): Next.js 14.0.4, nodemailer 6.9.7 (vulnerable)
- **v0.1.1** (Security Update): Next.js 14.2.35, nodemailer 7.0.7 (patched)

## References

- [Next.js Security](https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables)
- [npm audit documentation](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [OWASP Node.js Security](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html)
