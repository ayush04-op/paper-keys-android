# Security Policy

## Reporting a vulnerability

Please do **not** report security vulnerabilities in a public issue. Use GitHub’s **Report a vulnerability** action in the repository’s Security tab to contact the maintainers privately. Include the affected version or commit, Android version/device where relevant, impact, and concise reproduction steps. Avoid including real keyboard input or other people’s private data.

The maintainers will review the report and coordinate a fix and disclosure. Please allow time for investigation before publicly disclosing an unpatched issue. Do not access, modify, or retain data that is not yours while validating a report.

## Supported versions

Until the first tagged Android release, security fixes are handled against the latest `main` branch. After a release, the latest release is the primary supported version.

## Keyboard privacy scope

The native input service is intended to send selected key events to the focused editor through Android’s `InputConnection`. The service should not collect or transmit typed text. Reports that challenge this behavior are especially welcome through the private channel.
